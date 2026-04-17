import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_KIMI_BASE_URL,
  DEFAULT_KIMI_MODEL,
  isKimiAuthError,
  resolveKimiConfig,
} from './config'

describe('resolveKimiConfig', () => {
  test('uses KIMI_API_KEY when present', () => {
    expect(
      resolveKimiConfig({
        KIMI_API_KEY: 'sk-kimi',
        MOONSHOT_API_KEY: 'sk-moonshot',
      })
    ).toEqual({
      apiKey: 'sk-kimi',
      baseURL: DEFAULT_KIMI_BASE_URL,
      model: DEFAULT_KIMI_MODEL,
    })
  })

  test('falls back to Moonshot env names', () => {
    expect(
      resolveKimiConfig({
        MOONSHOT_API_KEY: 'sk-moonshot',
        MOONSHOT_BASE_URL: 'https://api.moonshot.cn/v1',
        KIMI_MODEL: 'kimi-latest',
      })
    ).toEqual({
      apiKey: 'sk-moonshot',
      baseURL: 'https://api.moonshot.cn/v1',
      model: 'kimi-latest',
    })
  })

  test('returns defaults when optional env vars are missing', () => {
    expect(resolveKimiConfig({})).toEqual({
      apiKey: undefined,
      baseURL: DEFAULT_KIMI_BASE_URL,
      model: DEFAULT_KIMI_MODEL,
    })
  })
})

describe('isKimiAuthError', () => {
  test('matches auth failures by status or type', () => {
    expect(isKimiAuthError({ status: 401 })).toBe(true)
    expect(isKimiAuthError({ type: 'invalid_authentication_error' })).toBe(true)
    expect(
      isKimiAuthError({
        error: { type: 'invalid_authentication_error' },
      })
    ).toBe(true)
  })

  test('ignores other failures', () => {
    expect(isKimiAuthError({ status: 429 })).toBe(false)
    expect(isKimiAuthError(new Error('boom'))).toBe(false)
    expect(isKimiAuthError(null)).toBe(false)
  })
})
