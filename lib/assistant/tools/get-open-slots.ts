import { tool } from 'ai'
import { z } from 'zod'
import { getBookingPageUrl } from '@/lib/assistant/config'
import { logAssistant, warnAssistant } from '@/lib/assistant/log'
import { fail, ok, type ToolResult } from '@/lib/assistant/tools/types'
import { fetchWithTimeout } from '@/lib/utils/fetch'

export const MAX_SLOTS_RETURNED = 12
export const BOOKING_TIMEOUT_MS = 8000

const slotSchema = z.object({ start: z.string(), end: z.string() })

const bookingPageSchema = z.object({
  title: z.string().default('Call with Edward'),
  duration_minutes: z.number(),
  time_zone: z.string(),
  slots: z.array(slotSchema),
})

export interface OpenSlots {
  title: string
  duration_minutes: number
  time_zone: string
  slots: { start: string; end: string }[]
}

export type BookingPage = z.infer<typeof bookingPageSchema>

export type FetchBookingPageResult =
  | { ok: true; page: BookingPage }
  | { ok: false; code: string; message_for_model: string }

/**
 * GET the booking page as JSON. The page URL is the credential, so it is
 * never logged and never returned. `format=json` plus an Accept header keep
 * the page from answering with its HTML form.
 */
export async function fetchBookingPage(): Promise<FetchBookingPageResult> {
  const base = getBookingPageUrl()
  if (!base) {
    warnAssistant('slots_refused', { reason: 'not_configured' })
    return fail(
      'not_configured',
      'Booking is not set up on this site. Tell the visitor to use the contact section, or offer to pass a message to Edward.'
    )
  }

  const startedAt = Date.now()
  try {
    const url = new URL(base)
    url.searchParams.set('format', 'json')
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: BOOKING_TIMEOUT_MS,
      cache: 'no-store',
    })

    if (response.status === 410 || response.status === 404) {
      warnAssistant('slots_refused', {
        reason: 'page_closed',
        status: response.status,
      })
      return fail(
        'page_closed',
        "Edward's booking page is closed right now. Offer to pass a message to Edward instead."
      )
    }

    if (!response.ok) {
      warnAssistant('slots_refused', {
        reason: 'upstream_status',
        status: response.status,
      })
      return fail(
        'calendar_unavailable',
        "The calendar did not answer. Tell the visitor you can't see Edward's open times right now and offer to pass a message instead."
      )
    }

    const parsed = bookingPageSchema.safeParse(await response.json())
    if (!parsed.success) {
      warnAssistant('slots_refused', { reason: 'bad_shape' })
      return fail(
        'calendar_unavailable',
        "The calendar answered in a shape I could not read. Tell the visitor you can't see Edward's open times right now."
      )
    }

    logAssistant('slots_fetched', {
      count: parsed.data.slots.length,
      ms: Date.now() - startedAt,
    })
    return { ok: true, page: parsed.data }
  } catch (error) {
    warnAssistant('slots_refused', {
      reason:
        error instanceof Error && error.name === 'AbortError'
          ? 'timeout'
          : 'unreachable',
      ms: Date.now() - startedAt,
    })
    return fail(
      'calendar_unavailable',
      "The calendar did not answer in time. Tell the visitor you can't see Edward's open times right now and offer to pass a message instead."
    )
  }
}

export async function runGetOpenSlots(): Promise<ToolResult<OpenSlots>> {
  const result = await fetchBookingPage()
  if (!result.ok) return result

  const slots = [...result.page.slots]
    .filter((slot) => Number.isFinite(Date.parse(slot.start)))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .slice(0, MAX_SLOTS_RETURNED)

  return ok({
    title: result.page.title,
    duration_minutes: result.page.duration_minutes,
    time_zone: result.page.time_zone,
    slots,
  })
}

export const getOpenSlotsTool = tool({
  description:
    "Read Edward's real open call times (the next 12 slots, plus the booking page's time zone). Use it when the visitor wants a call, a meeting or to see when Edward is free. The visitor sees the slots as buttons they can tap, so do not list the times in your reply: say how long the call is and invite them to pick one. Then use book_call once they choose a time and you have their name and email.",
  inputSchema: z.object({}),
  execute: async () => runGetOpenSlots(),
})
