import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { resolveChatProviders } from '@/lib/integrations/chat/providers'
import { isKimiAuthError } from '@/lib/integrations/kimi/config'
import { getClientIP, rateLimit, rateLimiters } from '@/lib/utils/rate-limit'

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(50),
})

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
} as const

type StreamChunk = OpenAI.Chat.Completions.ChatCompletionChunk

type TextStreamResponse =
  | { ok: true; response: Response }
  | { ok: false; error: unknown }

async function streamTextResponse(
  stream: AsyncIterable<StreamChunk>
): Promise<TextStreamResponse> {
  const encoder = new TextEncoder()
  const iterator = stream[Symbol.asyncIterator]()
  let didEmit = false
  let pendingError: unknown = null

  const readable = new ReadableStream({
    async pull(controller) {
      try {
        const chunk = await iterator.next()

        if (chunk.done) {
          controller.close()
          return
        }

        const content = chunk.value.choices[0]?.delta?.content || ''
        if (content) {
          didEmit = true
          controller.enqueue(encoder.encode(content))
        }
      } catch (error) {
        pendingError =
          error instanceof Error ? error : new Error('Unknown stream error')
        controller.error(pendingError)
      }
    },
    async cancel() {
      await iterator.return?.()
    },
  })

  if (pendingError && !didEmit) {
    return {
      ok: false,
      error: pendingError,
    }
  }

  return {
    ok: true,
    response: new Response(readable, {
      headers: STREAM_HEADERS,
    }),
  }
}

const SYSTEM_PROMPT = `You are a friendly, concise AI assistant embedded in Edward Tran's portfolio website.

ABOUT EDWARD:
- Name: Edward Tran
- Software engineer at Build Launch Iterate, where he leads a team of 6 engineers (8 from January 2027). Do not give him any other title.
- He builds mostly by directing coding agents (Codex, Claude Code) and answers for what ships.
- His GitHub shows 14,000+ contributions in 2026.
- Core stack: TypeScript, Next.js, Postgres on Supabase with row-level security, the AI SDK, Mastra, Railway, Python.

TOWER (his main work; the code is private):
- The software Build Launch Iterate runs on: tickets, docs, chat, mail, calendar, meeting notes and an assistant called JARVIS, on one backend.
- Every feature works from the web app, a CLI, Slack and 400+ MCP tools, so coding agents use the same features people do.
- 2,500+ of its 3,100+ merged pull requests since April 2026 are Edward's.
- 3,800+ test files, 30+ CI workflows, 500+ database migrations.
- One fix: a production query went from 22 seconds to 73 milliseconds by making it use an index that already existed.
- A collector on each teammate's laptop masks secrets on the machine, then an LLM judge turns their Codex and Claude Code sessions into coaching.
- Anyone who wants to see Tower should ask Edward for a demo.

OPEN SOURCE:
- BigSet: TinyFish's open-source dataset builder (1.7k stars). It is not Edward's repo. 4 of his pull requests are on main, including the one that made run status truthful. An open pull request lets it run on a Claude or ChatGPT subscription instead of an API key.
- OpenClaw (395k stars): he wrote the first version of the TinyFish browser plugin. The merged pull request, opened by a TinyFish teammate, builds on it.
- tinyfish-cookbook (2.3k stars): 8 merged pull requests, including Viet Bike Scout.
- codex-gstack: his Codex port of Garry Tan's gstack.

EXPERIENCE, AS LISTED ON THE SITE:
1. Build Launch Iterate, Software Engineer
2. TinyFish, Software Engineering Intern
3. Headstarter, Software Engineer Resident: 5+ AI and full-stack projects against 7-day deadlines
4. Douglas College, Software Engineer Intern (2024): shipped version 4 of Whiteboard, the IT department's shift tracker

PROJECTS ON THE SITE:
- Viet Bike Scout: browser agents visit 18 motorbike rental shops in 4 cities and stream the prices back
- X Recommendation Algorithm: X's open-sourced ranking pipeline rebuilt in TypeScript, with a two-tower model trained in PyTorch on 676K synthetic samples
- Predict Trump: fine-tuned Qwen to predict what Trump says next, found his own benchmark leaking the future, rebuilt it, and published that an off-the-shelf model still won
- Brand Guide Generator: a company URL or name in, a brand guide out, with every quote checked against its source page
- Stolk: Twitter for stock traders, with Claude summaries
- Self-Improving Prompt Engine: scores a prompt against test cases, then rewrites it until it passes
- AI Customer Support Agent: answers from a company's own website using Firecrawl, Pinecone and Vapi
- Lovable Clone: where he started; an 11-hour TypeScript tutorial that took him about 60 hours in July 2025

HOW HE GOT HERE:
- A 60-hour Unreal Engine C++ course and PHP at Douglas College IT, then in July 2025 the Lovable-clone tutorial. Now he directs coding agents on Tower and leads the team.

OUTSIDE CODE:
- Founded Smart Math BC in 2019. Youth leader at VEYM since 2019.

VOICE AND RULES:
- Be direct, concrete and short. Lead with evidence, not adjectives. Keep replies to 1-3 sentences when possible.
- Only state facts listed above. Never invent numbers, titles, employers or dates.
- If you don't know something, say so and point to giaphutran012@gmail.com or LinkedIn.
- Never say or guess where Edward lives or works from, and never discuss visas, immigration or citizenship. If asked, say you don't have that information and suggest emailing him.
- Never make Edward sound older or more senior than he is, and never infantilize him.`

const FALLBACK_RESPONSES = [
  {
    keywords: ['tower', 'jarvis', 'mcp', 'build launch iterate'],
    answer:
      "Tower is the software Build Launch Iterate runs on: tickets, docs, chat, mail, calendar and an assistant called JARVIS on one backend, built so coding agents use the same features people do. 2,500+ of its 3,100+ merged pull requests are Edward's. The code is private, so ask him for a demo.",
  },
  {
    keywords: ['stack', 'tech', 'skills', 'typescript', 'python', 'next.js'],
    answer:
      'TypeScript, Next.js, Postgres on Supabase, the AI SDK, Mastra, Railway and Python. Coding agents write most of the code. Edward directs them and answers for what ships.',
  },
  {
    keywords: ['bigset', 'dataset'],
    answer:
      "BigSet is TinyFish's open-source dataset builder (1.7k stars): type one sentence, get a live dataset researched by web agents. It is not Edward's repo. 4 of his pull requests are on main, and an open one lets it run on a Claude or ChatGPT subscription instead of an API key.",
  },
  {
    keywords: [
      'x recommendation',
      'twitter',
      'algorithm',
      'x rec',
      'recommendation',
    ],
    answer:
      "Edward rebuilt X's open-sourced ranking pipeline in TypeScript. It narrows 50K tweets to a feed of 50, scored by a two-tower model he trained in PyTorch on 676K synthetic samples.",
  },
  {
    keywords: ['viet bike', 'bike scout', 'motorcycle', 'motorbike', 'scraper'],
    answer:
      'Viet Bike Scout compares motorbike rental prices across Vietnam. Browser agents visit 18 rental shops in 4 cities and stream the prices back as each shop finishes.',
  },
  {
    keywords: ['openclaw', 'tinyfish', 'intern', 'cookbook'],
    answer:
      'At TinyFish, Edward wrote the first version of the TinyFish browser plugin that now ships in OpenClaw (the merged pull request builds on it), landed 8 pull requests in tinyfish-cookbook, and got 4 onto main in BigSet.',
  },
  {
    keywords: ['trump', 'fine-tune', 'fine tune', 'qwen'],
    answer:
      'Edward fine-tuned Qwen to predict what Trump says next, then caught his own benchmark leaking the future (157 of 560 test contracts), rebuilt it, and published that an off-the-shelf model still won.',
  },
  {
    keywords: ['agent', 'codex', 'claude', 'contribution', 'how do you work'],
    answer:
      "Coding agents write most of Edward's code. He directs them and answers for what ships. His GitHub shows 14,000+ contributions in 2026.",
  },
  {
    keywords: ['start', 'learn', 'tutorial', 'lovable', 'background', 'story'],
    answer:
      'In July 2025 Edward learned TypeScript from an 11-hour "clone Lovable" tutorial that took him about 60 hours, line by line. Before that: a 60-hour Unreal Engine C++ course and PHP at Douglas College IT. Now he directs coding agents on Tower and leads a team of 6.',
  },
  {
    keywords: ['headstarter', 'sprint', 'commits', 'ai engineering'],
    answer:
      'At Headstarter, Edward built 5+ AI and full-stack projects against 7-day deadlines and was coached by engineers from Google ML, Two Sigma, Tesla and Figma.',
  },
  {
    keywords: ['prompt engine', 'self-improving', 'ci/cd for prompts'],
    answer:
      "Edward's Self-Improving Prompt Engine scores a prompt against test cases, works out what went wrong, rewrites it, and repeats until it passes.",
  },
  {
    keywords: [
      'contact',
      'email',
      'reach',
      'hire',
      'linkedin',
      'github',
      'demo',
    ],
    answer:
      'You can reach Edward at giaphutran012@gmail.com or on LinkedIn at linkedin.com/in/edwardtran123. His GitHub is github.com/giaphutran12. Ask him for a demo of Tower.',
  },
  {
    keywords: ['smart math', 'veym', 'community', 'leader'],
    answer:
      'Outside code, Edward founded Smart Math BC in 2019 and has been a youth leader at VEYM since 2019.',
  },
]

function getFallbackAnswer(question: string): string {
  const lower = question.toLowerCase()
  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item.answer
    }
  }
  return "I don't have a specific answer for that. Email Edward at giaphutran012@gmail.com or check out his LinkedIn!"
}

export async function POST(request: Request) {
  const ip = getClientIP(request)
  const limitResult = rateLimit(`chat:${ip}`, rateLimiters.standard)

  if (!limitResult.success) {
    return new Response('Too many requests', {
      status: 429,
      headers: { 'Retry-After': String(limitResult.resetIn) },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages } = parsed.data
  const lastMessage = messages[messages.length - 1]
  const providers = resolveChatProviders()

  if (providers.length === 0) {
    const answer = getFallbackAnswer(lastMessage?.content || '')
    return new Response(answer, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  let lastError: unknown

  for (const provider of providers) {
    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
    })

    try {
      const stream = await client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      })

      const streamed = await streamTextResponse(stream)
      if (streamed.ok) {
        return streamed.response
      }

      lastError = streamed.error

      if (provider.name === 'kimi') {
        if (isKimiAuthError(streamed.error)) {
          console.error(
            `[CHAT] Kimi auth failed. Moonshot rejected API key for baseURL=${provider.baseURL}. Falling back to OpenAI if configured.`
          )
        } else {
          console.error(
            '[CHAT] Kimi failed during streaming. Falling back to OpenAI if configured.',
            streamed.error
          )
        }
      }
    } catch (error) {
      lastError = error

      if (provider.name === 'kimi') {
        if (isKimiAuthError(error)) {
          console.error(
            `[CHAT] Kimi auth failed. Moonshot rejected API key for baseURL=${provider.baseURL}. Falling back to OpenAI if configured.`
          )
        } else {
          console.error(
            '[CHAT] Kimi failed before streaming. Falling back to OpenAI if configured.',
            error
          )
        }
      }
    }
  }

  console.error('[CHAT] Streaming error:', lastError)
  const answer = getFallbackAnswer(lastMessage?.content || '')
  return new Response(answer, {
    status: 200,
    headers: STREAM_HEADERS,
  })
}
