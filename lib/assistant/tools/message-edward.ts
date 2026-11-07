import { tool } from 'ai'
import { z } from 'zod'
import { getResendConfig } from '@/lib/assistant/config'
import { allowAction } from '@/lib/assistant/limits'
import { logAssistant, warnAssistant } from '@/lib/assistant/log'
import {
  fail,
  ok,
  type ToolContext,
  type ToolResult,
} from '@/lib/assistant/tools/types'
import { fetchWithTimeout } from '@/lib/utils/fetch'

export const MESSAGE_MAX_CHARS = 2000
export const RESEND_TIMEOUT_MS = 8000
const RESEND_URL = 'https://api.resend.com/emails'

/** What the model sees: plain strings (see the note in book-call.ts). */
export const messageEdwardInputSchema = z.object({
  visitor_name: z.string().describe("The visitor's name."),
  visitor_email: z
    .string()
    .describe(
      "The visitor's email address, exactly as they typed it. Never guess one."
    ),
  message: z
    .string()
    .describe(
      `The message for Edward, in the visitor's own words (up to ${MESSAGE_MAX_CHARS} characters).`
    ),
})

export type MessageEdwardInput = z.infer<typeof messageEdwardInputSchema>

const messageChecks = z.object({
  visitor_name: z.string().trim().min(1).max(120),
  visitor_email: z.email().max(254),
  message: z.string().trim().min(1).max(MESSAGE_MAX_CHARS),
})

export function checkMessageEdwardInput(
  input: unknown
): { ok: true; data: z.infer<typeof messageChecks> } | { ok: false } {
  const parsed = messageChecks.safeParse(input)
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false }
}

/** Asked before the card is shown: a malformed call is denied, not shown. */
export function approvalForMessageEdward(input: unknown) {
  if (checkMessageEdwardInput(input).ok) return 'user-approval' as const
  return {
    type: 'denied' as const,
    reason: `The name, email or message was not valid (the message can be up to ${MESSAGE_MAX_CHARS} characters). Ask the visitor to fix it, then try again.`,
  }
}

export interface MessageSent {
  note: string
}

function refusal(reason: string, code: string, message: string) {
  warnAssistant('message_refused', { reason })
  return fail(code, message)
}

/** Header values must be one line. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export async function runMessageEdward(
  ctx: ToolContext,
  rawInput: unknown
): Promise<ToolResult<MessageSent>> {
  const checked = checkMessageEdwardInput(rawInput)
  if (!checked.ok) {
    return refusal(
      'invalid_input',
      'invalid_input',
      'The name, email or message was not valid. Ask the visitor to fix it and try again.'
    )
  }
  const input = checked.data

  const config = getResendConfig()
  if (!config) {
    return refusal(
      'not_configured',
      'not_configured',
      'Messages cannot be sent from this site right now. Tell the visitor to use the email address in the contact section.'
    )
  }

  if (!allowAction(ctx.ip)) {
    return fail(
      'rate_limited',
      'This visitor has already booked or messaged several times in the last hour. Tell them to try again later or use the email address in the contact section.'
    )
  }

  const startedAt = Date.now()
  let response: Response
  try {
    response = await fetchWithTimeout(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: input.visitor_email,
        subject: `Portfolio message from ${oneLine(input.visitor_name)}`,
        text: `${input.message}\n\n--\nFrom: ${oneLine(input.visitor_name)} <${input.visitor_email}>\nSent through the portfolio assistant.`,
      }),
      timeout: RESEND_TIMEOUT_MS,
    })
  } catch (error) {
    return refusal(
      error instanceof Error && error.name === 'AbortError'
        ? 'timeout'
        : 'unreachable',
      'send_failed',
      'The message could not be sent, so Edward has not received it. Tell the visitor and point them to the email address in the contact section.'
    )
  }

  if (!response.ok) {
    return refusal(
      `upstream_${response.status}`,
      'send_failed',
      'The message could not be sent, so Edward has not received it. Tell the visitor and point them to the email address in the contact section.'
    )
  }

  const body: unknown = await response.json().catch(() => null)
  const id =
    body &&
    typeof body === 'object' &&
    'id' in body &&
    typeof body.id === 'string'
      ? body.id
      : null
  logAssistant('message_sent', { id, ms: Date.now() - startedAt })
  return ok({
    note: 'Edward has the message and can reply to the visitor by email.',
  })
}

export function createMessageEdwardTool(ctx: ToolContext) {
  return tool({
    description:
      "Send Edward a message by email, with the visitor's address as the reply-to. The visitor is shown a confirm card with the exact text and must press Confirm before anything is sent. Use it when the visitor asks to contact Edward, or when you could not answer a question from the knowledge and they want it passed on. Ask for their name and email first; never invent them. Write the message in the visitor's own words, not a summary of the chat. If the visitor cancels, do not offer it again.",
    inputSchema: messageEdwardInputSchema,
    execute: async (input) => runMessageEdward(ctx, input),
  })
}
