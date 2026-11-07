import { openai } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getApprovalSecret,
  getAssistantModelId,
  hasOpenAiKey,
  NOT_CONFIGURED_REPLY,
} from '@/lib/assistant/config'
import {
  ASSISTANT_INSTRUCTIONS,
  buildTurnContext,
  PROMPT_VERSION,
} from '@/lib/assistant/instructions'
import {
  CHAT_LIMIT,
  MAX_MESSAGES,
  MAX_TEXT_PART_CHARS,
} from '@/lib/assistant/limits'
import { errorAssistant, logAssistant } from '@/lib/assistant/log'
import {
  ASSISTANT_TOOL_APPROVAL,
  createAssistantTools,
} from '@/lib/assistant/tools'
import { getClientIP, rateLimit } from '@/lib/utils/rate-limit'

export const maxDuration = 30

const MAX_STEPS = 5
const MAX_OUTPUT_TOKENS = 600

/**
 * Loose on purpose: the UI message format is the AI SDK's to define, so this
 * only rejects what is dangerous or absurd. No system messages from the
 * client, at most 40 messages, text parts capped at 4000 characters, and only
 * text, step markers and tool parts (no files, sources or data parts).
 */
const textPartSchema = z.looseObject({
  type: z.literal('text'),
  text: z.string().max(MAX_TEXT_PART_CHARS),
})

const otherPartSchema = z.looseObject({
  type: z.string().regex(/^(step-start|tool-[a-z_]{1,48})$/),
})

const requestSchema = z.object({
  messages: z
    .array(
      z.looseObject({
        id: z.string().max(128).optional(),
        role: z.enum(['user', 'assistant']),
        parts: z.array(z.union([textPartSchema, otherPartSchema])).max(60),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
})

/** One text answer, in the UI message stream format the chat hook expects. */
function textStreamResponse(text: string): Response {
  const id = 'text-0'
  const chunks: UIMessageChunk[] = [
    { type: 'start' },
    { type: 'start-step' },
    { type: 'text-start', id },
    { type: 'text-delta', id, delta: text },
    { type: 'text-end', id },
    { type: 'finish-step' },
    { type: 'finish' },
  ]
  return createUIMessageStreamResponse({
    stream: new ReadableStream<UIMessageChunk>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    }),
  })
}

export async function POST(request: Request) {
  const startedAt = performance.now()
  const ip = getClientIP(request)
  const limitResult = rateLimit(`chat:${ip}`, CHAT_LIMIT)

  if (!limitResult.success) {
    logAssistant('rate_limited', {
      scope: 'chat',
      retry_in_s: limitResult.resetIn,
    })
    return new Response('Too many requests', {
      status: 429,
      headers: { 'Retry-After': String(limitResult.resetIn) },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    logAssistant('request_refused', { reason: 'invalid_json' })
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    logAssistant('request_refused', { reason: 'invalid_body' })
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!hasOpenAiKey()) {
    logAssistant('turn_done', { reason: 'not_configured', ms: 0 })
    return textStreamResponse(NOT_CONFIGURED_REPLY)
  }

  const messages = parsed.data.messages as unknown as UIMessage[]
  const modelId = getAssistantModelId()
  const tools = createAssistantTools({ ip })
  const approvalSecret = getApprovalSecret()

  const modelMessages = await convertToModelMessages(messages, { tools })
  const turnContext = buildTurnContext(new Date())

  logAssistant('turn_start', { model: modelId, history: messages.length })

  const result = streamText({
    model: openai(modelId),
    instructions: ASSISTANT_INSTRUCTIONS,
    messages: modelMessages,
    allowSystemInMessages: true,
    tools,
    toolApproval: ASSISTANT_TOOL_APPROVAL,
    ...(approvalSecret
      ? { experimental_toolApprovalSecret: approvalSecret }
      : {}),
    stopWhen: isStepCount(MAX_STEPS),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: {
      openai: {
        reasoningEffort: 'none',
        store: false,
        promptCacheKey: PROMPT_VERSION,
      },
    },
    // On the last allowed step the model must answer in words, not call a tool.
    //
    // Per-turn facts (the date) close the prompt as the last system message so
    // the fixed instructions stay cacheable. They are added here, per step,
    // not appended to `messages` up front: a system message after the visitor's
    // approval answer hides it and the SDK then refuses to run the tool.
    prepareStep: ({ stepNumber, messages: stepMessages }) => ({
      messages: [
        ...stepMessages.filter(
          (message) =>
            !(message.role === 'system' && message.content === turnContext)
        ),
        { role: 'system' as const, content: turnContext },
      ],
      ...(stepNumber >= MAX_STEPS - 1
        ? { activeTools: [], toolChoice: 'none' as const }
        : {}),
    }),
    onError: ({ error }) => {
      errorAssistant('turn_error', {
        reason: error instanceof Error ? error.name : 'stream_error',
        ms: Math.round(performance.now() - startedAt),
      })
    },
    onEnd: (event) => {
      const toolNames = new Set<string>()
      for (const step of event.steps) {
        for (const call of step.toolCalls) toolNames.add(call.toolName)
      }
      logAssistant('turn_done', {
        steps: event.steps.length,
        tools: toolNames.size > 0 ? [...toolNames].join(',') : 'none',
        ms: Math.round(performance.now() - startedAt),
        finish: event.finishReason,
      })
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
      sendReasoning: false,
      onError: () => 'assistant_stream_error',
    }),
  })
}
