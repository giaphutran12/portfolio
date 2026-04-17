import { resolveKimiConfig } from '@/lib/integrations/kimi/config'

export const OPENAI_FALLBACK_MODEL = 'gpt-5.4-nano'

export type ChatProvider = {
  name: 'kimi' | 'openai'
  apiKey: string
  model: string
  baseURL?: string
}

type EnvMap = Record<string, string | undefined>

export function resolveChatProviders(
  env: EnvMap = process.env
): ChatProvider[] {
  const providers: ChatProvider[] = []
  const kimi = resolveKimiConfig(env)

  if (kimi.apiKey) {
    providers.push({
      name: 'kimi',
      apiKey: kimi.apiKey,
      model: kimi.model,
      baseURL: kimi.baseURL,
    })
  }

  if (env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      apiKey: env.OPENAI_API_KEY,
      model: OPENAI_FALLBACK_MODEL,
    })
  }

  return providers
}
