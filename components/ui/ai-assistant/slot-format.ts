/**
 * Times from the calendar arrive as ISO instants. The visitor always sees them
 * in their own time zone, with the zone's short name, so "9:00 AM PST" never
 * has to be converted in someone's head.
 */

const SLOT_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
}

export function formatSlotTime(iso: string, locale?: string): string {
  const time = Date.parse(iso)
  if (!Number.isFinite(time)) return iso
  return new Intl.DateTimeFormat(locale, SLOT_FORMAT).format(new Date(time))
}

/** Marks the second text part of a slot click, which carries the exact instant for the model. */
export const SLOT_CONTEXT_PREFIX = '[slot start='

export function slotContextText(iso: string): string {
  return `${SLOT_CONTEXT_PREFIX}${iso}]`
}

export function isSlotContextText(text: string): boolean {
  return text.startsWith(SLOT_CONTEXT_PREFIX)
}
