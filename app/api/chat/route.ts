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
- Based in Vancouver, BC
- Identity: AI engineer focused on AI + full-stack product engineering
- Education: studied CS at Douglas College, transferred to SFU
- Core stack: TypeScript, Python, Next.js, React, Supabase, Postgres, AI/LLM systems
- Public shorthand: "AI engineer shipping enterprise-grade apps that solve real problems"
- Hero tagline: "AI Engineer. Ships Code."

EXPERIENCE:
1. Build Launch Iterate — Software Engineer (Aug 2025–Present)
   - Launched PearlPortal, an enterprise-grade CRM with AI call analysis and loan proposal generator
   - Helped make at least one firm switch from Salesforce after 20 years
   - Saves each broker about 3 hours per day
   - Rebuilt company website to convert 3x better and load 2x faster

2. TinyFish — Software Engineering Intern (Mar 2026–Present)
   - Ships 1-2 apps per week using browser agents
   - Automates what scrapers can't: logins, paywalls, multi-step flows
   - Built Viet Bike Scout using parallel browser agents across 18+ rental shops with real-time pricing

3. Headstarter — Software Engineer Resident (Jul 2025–Present)
   - Built 5+ AI engineering and full-stack projects
   - 163+ commits in a 7-day sprint
   - Implemented LLM chaining, hyperparameter tuning, fine-tuning across 5+ models
   - Coached by engineers from Google ML, Two Sigma, Tesla, Figma

4. Douglas College — Software Engineering Intern (Apr 2024–Dec 2024)
   - Built White Board ITS, a work-day management web app used by 117 IT staff
   - Shipped 11 production features, reduced task delegation time by 75%

OTHER EXPERIENCE:
- Founder of Smart Math BC since Jan 2019 (teaching, sales, long-term ownership)
- Youth Leader at VEYM since Jan 2019 (public speaking, mentorship, hosted 10+ camps)
- Campus Ambassador at Vancouver.dev since Oct 2023 (10+ technical community events)
- Core Team Member at AI Tinkerers since Feb 2026

FEATURED PROJECTS:
- X Recommendation Algorithm: reverse-engineered X's recommendation engine, built ML pipeline in PyTorch/ONNX
- Viet Bike Scout: real-time motorcycle marketplace aggregator for Vietnam using parallel browser agents
- AutoResearch macOS: AI research assistant in Swift that browses, reads, and synthesizes into reports
- Self-Improving Prompt Engine: CI/CD for prompts, +42% score lift across 10K+ prompts
- Serverless Image Style Transfer: Rust + WASM in-browser, 95% cost reduction
- Intelligent LLM Router: routes AI requests to optimal model, ~100ms overhead
- AI Customer Support Agent: fintech support with Firecrawl, Pinecone, VAPI, reduced overhead ~80%
- Lovable Clone: full-stack AI code generator with sandboxed previews, auth, payments, Postgres
- StockTwits Clone: real-time social trading platform with WebSocket feeds

VOICE AND RULES:
- Be direct, confident, concrete, slightly intense in a good way
- Not corporate, not cringey
- Use short, punchy statements
- Lead with evidence, not adjectives
- If you don't know something, say so and direct the user to email giaphutran012@gmail.com or connect on LinkedIn
- Never make Edward sound older or more senior than he is, and never infantilize him
- Keep replies brief (1-3 sentences when possible)`

const FALLBACK_RESPONSES = [
  {
    keywords: ['stack', 'tech', 'skills', 'typescript', 'python', 'next.js'],
    answer:
      'TypeScript, Python, Next.js, React, Supabase, Postgres, and whatever AI stack gets the job done. Full-stack when needed, AI-heavy when useful.',
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
      "Edward reverse-engineered X's recommendation engine using PyTorch and ONNX. He built a full ML pipeline that decoded what makes content viral and proved it with data.",
  },
  {
    keywords: [
      'viet bike',
      'bike scout',
      'motorcycle',
      'scraper',
      'browser agent',
    ],
    answer:
      'Viet Bike Scout aggregates real-time motorcycle pricing across 18+ rental shops in Vietnam. It uses parallel browser agents to handle logins and dynamic content that break traditional scrapers.',
  },
  {
    keywords: ['tinyfish', 'intern', 'browser agents', 'automation'],
    answer:
      "At TinyFish, Edward ships 1-2 apps per week using browser agents to automate flows that scrapers can't handle — logins, paywalls, and multi-step forms.",
  },
  {
    keywords: ['headstarter', 'sprint', 'commits', 'ai engineering'],
    answer:
      'At Headstarter, Edward built 5+ AI/full-stack projects, hit 163+ commits in a 7-day sprint, and was coached by engineers from Google ML, Two Sigma, Tesla, and Figma.',
  },
  {
    keywords: ['prompt engine', 'self-improving', 'ci/cd for prompts'],
    answer:
      "Edward's Self-Improving Prompt Engine is basically CI/CD for prompts. It averaged a +42% score lift across 10K+ prompts using multi-agent feedback loops.",
  },
  {
    keywords: ['contact', 'email', 'reach', 'hire', 'linkedin', 'github'],
    answer:
      'You can reach Edward at giaphutran012@gmail.com or connect on LinkedIn at linkedin.com/in/edwardtran123. His GitHub is github.com/giaphutran12.',
  },
  {
    keywords: ['smart math', 'veym', 'community', 'leader'],
    answer:
      'Outside code, Edward founded Smart Math BC in 2019 and has been a youth leader at VEYM for 6+ years, hosting 10+ camps and retreats.',
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
