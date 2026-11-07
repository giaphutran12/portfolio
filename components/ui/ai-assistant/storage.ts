import { isToolUIPart } from 'ai'
import type { AssistantUIMessage } from './types'

export const STORAGE_KEY = 'edward-portfolio-agent-v1'
/** The plain-text chat history from before the agent. Dropped on first load. */
export const LEGACY_STORAGE_KEY = 'edward-portfolio-chat'

/** The server accepts 40 messages; stay under it so a long chat never turns into a 400. */
export const MAX_STORED_MESSAGES = 36

const SETTLED_TOOL_STATES = new Set([
  'output-available',
  'output-error',
  'output-denied',
])

function isMessage(value: unknown): value is AssistantUIMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as { id?: unknown; role?: unknown; parts?: unknown }
  return (
    typeof message.id === 'string' &&
    (message.role === 'user' || message.role === 'assistant') &&
    Array.isArray(message.parts)
  )
}

/** A tool call still waiting on someone (a card, the browser, the stream). */
function hasUnsettledToolCall(message: AssistantUIMessage): boolean {
  return message.parts.some(
    (part) => isToolUIPart(part) && !SETTLED_TOOL_STATES.has(part.state)
  )
}

/**
 * Drops assistant turns that never finished (a closed tab mid-stream, a
 * dropped connection, a card nobody answered). Sending one back would make the
 * model API reject the whole history.
 */
export function dropUnsettledTurns(
  messages: AssistantUIMessage[]
): AssistantUIMessage[] {
  const settled = messages.filter(
    (message) =>
      !(message.role === 'assistant' && hasUnsettledToolCall(message))
  )
  return settled
}

/** The slice of history that is safe and small enough to send. Starts on a visitor message. */
export function trimHistory(
  messages: AssistantUIMessage[],
  max = MAX_STORED_MESSAGES
): AssistantUIMessage[] {
  const tail = messages.slice(-max)
  const firstUser = tail.findIndex((message) => message.role === 'user')
  return firstUser === -1 ? [] : tail.slice(firstUser)
}

export function loadStoredMessages(): AssistantUIMessage[] {
  if (typeof window === 'undefined') return []

  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return trimHistory(dropUnsettledTurns(parsed.filter(isMessage)))
  } catch {
    return []
  }
}

export function saveMessages(messages: AssistantUIMessage[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(trimHistory(dropUnsettledTurns(messages)))
    )
  } catch {
    // storage full or blocked: the chat still works, it just won't persist
  }
}
