/**
 * Runtime configuration for the assistant, read from process.env on each call.
 *
 * `lib/env.ts` parses the environment once at import time, which is the wrong
 * moment for secrets that tests and serverless instances set later, so the
 * assistant reads at call time. Names are registered in `lib/env.ts`,
 * `lib/utils/validation.ts` and `.env.example`.
 */

export const DEFAULT_ASSISTANT_MODEL = 'gpt-6-luna'
export const DEFAULT_CONTACT_TO_EMAIL = 'giaphutran012@gmail.com'

/** Shown when OPENAI_API_KEY is missing. One fixed text, no keyword table. */
export const NOT_CONFIGURED_REPLY =
  "The assistant is offline right now. You can reach Edward from the contact section at the bottom of this page, and he'll get back to you."

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function getAssistantModelId(): string {
  return readEnv('ASSISTANT_MODEL') ?? DEFAULT_ASSISTANT_MODEL
}

export function hasOpenAiKey(): boolean {
  return readEnv('OPENAI_API_KEY') !== undefined
}

/** Server-only. The URL is the credential for the booking page: never log it. */
export function getBookingPageUrl(): string | undefined {
  const url = readEnv('BOOKING_PAGE_URL')
  return url ? url.replace(/\/+$/, '') : undefined
}

export function getResendConfig():
  | { apiKey: string; from: string; to: string }
  | undefined {
  const apiKey = readEnv('RESEND_API_KEY')
  const from = readEnv('CONTACT_FROM_EMAIL')
  if (!(apiKey && from)) return undefined
  return {
    apiKey,
    from,
    to: readEnv('CONTACT_TO_EMAIL') ?? DEFAULT_CONTACT_TO_EMAIL,
  }
}

/** Optional. When set, the SDK signs approval requests so a crafted history cannot fake a confirmation. */
export function getApprovalSecret(): string | undefined {
  return readEnv('ASSISTANT_APPROVAL_SECRET')
}
