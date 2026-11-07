/**
 * One log line shape for everything the assistant does:
 * `[ASSISTANT] v=<PROMPT_VERSION> event=<name> k=v`.
 *
 * Ids, counts, milliseconds and closed labels only. Message text, names,
 * emails and tool arguments never reach a log. To make that structural rather
 * than a habit, a string value must look like an id or a label; anything else
 * is replaced with `redacted`.
 */

import { PROMPT_VERSION } from '@/lib/assistant/instructions'

type LogValue = string | number | boolean | null | undefined

const SAFE_LABEL = /^[A-Za-z0-9_:.,-]{1,64}$/

function render(value: LogValue): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(Math.round(value * 1e6) / 1e6) : '-'
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return SAFE_LABEL.test(value) ? value : 'redacted'
}

export function assistantLogLine(
  event: string,
  fields: Record<string, LogValue> = {}
): string {
  const parts = Object.entries(fields).map(
    ([key, value]) => `${key}=${render(value)}`
  )
  return `[ASSISTANT] v=${PROMPT_VERSION} event=${event} ${parts.join(' ')}`.trimEnd()
}

export function logAssistant(
  event: string,
  fields: Record<string, LogValue> = {}
): void {
  console.log(assistantLogLine(event, fields))
}

export function warnAssistant(
  event: string,
  fields: Record<string, LogValue> = {}
): void {
  console.warn(assistantLogLine(event, fields))
}

export function errorAssistant(
  event: string,
  fields: Record<string, LogValue> = {}
): void {
  console.error(assistantLogLine(event, fields))
}
