import { describe, expect, test } from 'bun:test'
import { OPENAI_FALLBACK_MODEL, resolveChatProviders } from './providers'

describe('resolveChatProviders', () => {
  test('returns Kimi first, then OpenAI fallback', () => {
    expect(
      resolveChatProviders({
        KIMI_API_KEY: 'sk-kimi',
        OPENAI_API_KEY: 'sk-openai',
      })
    ).toEqual([
      {
        name: 'kimi',
        apiKey: 'sk-kimi',
        model: 'kimi-k2.5',
        baseURL: 'https://api.moonshot.ai/v1',
      },
      {
        name: 'openai',
        apiKey: 'sk-openai',
        model: OPENAI_FALLBACK_MODEL,
      },
    ])
  })

  test('uses OpenAI only when Kimi is missing', () => {
    expect(
      resolveChatProviders({
        OPENAI_API_KEY: 'sk-openai',
      })
    ).toEqual([
      {
        name: 'openai',
        apiKey: 'sk-openai',
        model: OPENAI_FALLBACK_MODEL,
      },
    ])
  })

  test('returns empty array when no provider key exists', () => {
    expect(resolveChatProviders({})).toEqual([])
  })
})
