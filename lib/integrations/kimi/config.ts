type EnvMap = Record<string, string | undefined>

export const DEFAULT_KIMI_BASE_URL = 'https://api.moonshot.ai/v1'
export const DEFAULT_KIMI_MODEL = 'kimi-k2.5'

export type KimiConfig = {
  apiKey: string | undefined
  baseURL: string
  model: string
}

export function resolveKimiConfig(env: EnvMap = process.env): KimiConfig {
  return {
    apiKey: env.KIMI_API_KEY || env.MOONSHOT_API_KEY,
    baseURL:
      env.KIMI_BASE_URL || env.MOONSHOT_BASE_URL || DEFAULT_KIMI_BASE_URL,
    model: env.KIMI_MODEL || DEFAULT_KIMI_MODEL,
  }
}

export function isKimiAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as {
    status?: unknown
    type?: unknown
    error?: { type?: unknown } | null
  }

  return (
    maybeError.status === 401 ||
    maybeError.type === 'invalid_authentication_error' ||
    maybeError.error?.type === 'invalid_authentication_error'
  )
}
