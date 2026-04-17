import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test'

type MockProvider = {
  name: 'kimi' | 'openai'
  apiKey: string
  model: string
  baseURL?: string
}

let providersMock: MockProvider[] = []
let kimiAuthError = false
let createImpl: (() => Promise<AsyncIterable<unknown>>) | null = null

mock.module('@/lib/integrations/chat/providers', () => ({
  resolveChatProviders: () => providersMock,
}))

mock.module('@/lib/integrations/kimi/config', () => ({
  isKimiAuthError: () => kimiAuthError,
}))

mock.module('@/lib/utils/rate-limit', () => ({
  getClientIP: () => '127.0.0.1',
  rateLimit: () => ({ success: true, resetIn: 0 }),
  rateLimiters: { standard: {} },
}))

mock.module('openai', () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: async () => {
          if (!createImpl) {
            throw new Error('createImpl not configured')
          }
          return createImpl()
        },
      },
    }
  },
}))

async function streamFromText(text: string) {
  return (async function* () {
    yield {
      choices: [{ delta: { content: text } }],
    }
  })()
}

let POST: typeof import('./route').POST

beforeAll(async () => {
  ;({ POST } = await import('./route'))
})

afterEach(() => {
  providersMock = []
  kimiAuthError = false
  createImpl = null
})

describe('POST /api/chat', () => {
  test('returns fallback answer when no providers are configured', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is your stack?' }],
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('TypeScript')
  })

  test('falls back to OpenAI when Kimi auth fails', async () => {
    providersMock = [
      {
        name: 'kimi',
        apiKey: 'kimi',
        model: 'kimi-k2.5',
        baseURL: 'https://api.moonshot.ai/v1',
      },
      { name: 'openai', apiKey: 'openai', model: 'gpt-5.4-nano' },
    ]

    let callCount = 0
    createImpl = async () => {
      callCount += 1
      if (callCount === 1) {
        kimiAuthError = true
        throw { status: 401 }
      }

      return streamFromText('openai fallback works')
    }

    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hello' }],
        }),
      })
    )

    expect(callCount).toBe(2)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('openai fallback works')
  })

  test('returns 400 for invalid JSON payloads', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not-json',
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid JSON' })
  })
})
