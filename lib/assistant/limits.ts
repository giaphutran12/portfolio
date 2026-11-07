/**
 * Limits for the assistant.
 *
 * - chat: the route-wide per-IP limit (`rateLimiters.standard`, 20 a minute).
 * - action: book_call and message_edward share one stricter bucket, 3 an hour
 *   per IP. Both send something to a real person, so a bot gets a few tries.
 *
 * Both use the in-memory limiter in `lib/utils/rate-limit.ts`, which is per
 * server instance: on serverless a determined caller can spread across
 * instances. Fine for a portfolio; swap for Upstash/KV if abuse shows up.
 */

import { logAssistant } from '@/lib/assistant/log'
import {
  type RateLimitConfig,
  rateLimit,
  rateLimiters,
} from '@/lib/utils/rate-limit'

export const MAX_MESSAGES = 40
export const MAX_TEXT_PART_CHARS = 4000

export const ACTION_LIMIT: RateLimitConfig = { limit: 3, windowSeconds: 3600 }
export const CHAT_LIMIT: RateLimitConfig = rateLimiters.standard

/** True when this IP may still run an approved action. Logs the refusal. */
export function allowAction(ip: string): boolean {
  const result = rateLimit(`assistant-action:${ip}`, ACTION_LIMIT)
  if (!result.success) {
    logAssistant('rate_limited', {
      scope: 'action',
      retry_in_s: result.resetIn,
    })
  }
  return result.success
}
