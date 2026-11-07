import { tool } from 'ai'
import { z } from 'zod'
import { getBookingPageUrl } from '@/lib/assistant/config'
import { allowAction } from '@/lib/assistant/limits'
import { logAssistant, warnAssistant } from '@/lib/assistant/log'
import {
  BOOKING_TIMEOUT_MS,
  fetchBookingPage,
} from '@/lib/assistant/tools/get-open-slots'
import {
  fail,
  ok,
  type ToolContext,
  type ToolResult,
} from '@/lib/assistant/tools/types'
import { fetchWithTimeout } from '@/lib/utils/fetch'

/**
 * What the model sees. Plain strings only: OpenAI strict tool schemas reject
 * the regex lookaheads zod emits for z.email() and the length keywords, so the
 * real checks live in `bookCallChecks` and run before the confirm card is
 * shown (see `approvalForBookCall`) and again before anything is sent.
 */
export const bookCallInputSchema = z.object({
  start: z
    .string()
    .describe(
      'Start time as an ISO 8601 string, copied exactly from a slot returned by get_open_slots.'
    ),
  guest_name: z.string().describe("The visitor's name."),
  guest_email: z
    .string()
    .describe(
      "The visitor's email address, exactly as they typed it. Never guess one."
    ),
  note: z
    .string()
    .nullable()
    .describe(
      'Optional short note for Edward (up to 1000 characters), or null.'
    ),
})

export type BookCallInput = z.infer<typeof bookCallInputSchema>

const bookCallChecks = z.object({
  start: z.iso.datetime({ offset: true }),
  guest_name: z.string().trim().min(1).max(120),
  guest_email: z.email().max(254),
  note: z.string().trim().max(1000).nullable(),
})

export function checkBookCallInput(
  input: unknown
): { ok: true; data: z.infer<typeof bookCallChecks> } | { ok: false } {
  const parsed = bookCallChecks.safeParse(input)
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false }
}

/** Asked before the card is shown: a malformed call is denied, not shown. */
export function approvalForBookCall(input: unknown) {
  if (checkBookCallInput(input).ok) return 'user-approval' as const
  return {
    type: 'denied' as const,
    reason:
      'The name, email or time was not valid. Ask the visitor for a valid email address and a name, then try again.',
  }
}

export interface BookedCall {
  start: string
  note: string
}

function refusal(reason: string, code: string, message: string) {
  warnAssistant('booking_refused', { reason })
  return fail(code, message)
}

export async function runBookCall(
  ctx: ToolContext,
  rawInput: unknown,
  toolCallId: string
): Promise<ToolResult<BookedCall>> {
  const checked = checkBookCallInput(rawInput)
  if (!checked.ok) {
    return refusal(
      'invalid_input',
      'invalid_input',
      'The name, email or time was not valid. Ask the visitor for a valid email address and try again.'
    )
  }
  const input = checked.data

  const base = getBookingPageUrl()
  if (!base) {
    return refusal(
      'not_configured',
      'not_configured',
      'Booking is not set up on this site. Tell the visitor to use the contact section, or offer to pass a message to Edward.'
    )
  }

  // The time must be one the calendar still offers right now.
  const page = await fetchBookingPage()
  if (!page.ok) return page
  const wanted = Date.parse(input.start)
  if (!page.page.slots.some((slot) => Date.parse(slot.start) === wanted)) {
    return refusal(
      'slot_not_offered',
      'slot_unavailable',
      'That time is not open any more. Call get_open_slots again and offer fresh times.'
    )
  }

  if (!allowAction(ctx.ip)) {
    return fail(
      'rate_limited',
      'This visitor has already booked or messaged several times in the last hour. Tell them to try again later or use the contact section.'
    )
  }

  const startedAt = Date.now()
  let response: Response
  try {
    response = await fetchWithTimeout(`${base}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        start: input.start,
        guest_name: input.guest_name,
        guest_email: input.guest_email,
        ...(input.note ? { note: input.note } : {}),
        request_key: toolCallId,
      }),
      timeout: BOOKING_TIMEOUT_MS,
      cache: 'no-store',
    })
  } catch (error) {
    return refusal(
      error instanceof Error && error.name === 'AbortError'
        ? 'timeout'
        : 'unreachable',
      'calendar_unavailable',
      'The calendar did not answer, so nothing was booked. Tell the visitor and offer to pass a message to Edward instead.'
    )
  }

  // 201 (new) and 200 (same request_key replayed) both mean the slot is held.
  // The body carries a manage token and URL for the guest; they are never
  // read, returned or logged here (the guest gets them in the calendar invite).
  if (response.status === 201 || response.status === 200) {
    logAssistant('booking_created', {
      status: response.status,
      ms: Date.now() - startedAt,
    })
    return ok({
      start: input.start,
      note: 'A calendar invite is on its way to the visitor.',
    })
  }

  if (response.status === 409) {
    return refusal(
      'slot_taken',
      'slot_taken',
      'Someone just took that time. Call get_open_slots again and offer fresh times.'
    )
  }
  if (response.status === 429) {
    return refusal(
      'guest_limit',
      'guest_limit',
      'This email address has too many bookings with Edward already. Tell the visitor and suggest the contact section.'
    )
  }
  if (response.status === 410) {
    return refusal(
      'page_closed',
      'page_closed',
      "Edward's booking page is closed right now. Offer to pass a message to Edward instead."
    )
  }
  return refusal(
    `upstream_${response.status}`,
    'calendar_unavailable',
    'The calendar could not book that, so nothing was booked. Tell the visitor and offer to pass a message to Edward instead.'
  )
}

export function createBookCallTool(ctx: ToolContext) {
  return tool({
    description:
      "Book a call on Edward's calendar. The visitor is shown a confirm card with the exact time, name and email and must press Confirm before anything is booked. Use it only after the visitor picked one of the times from get_open_slots and you have their real name and email (ask for them first; never invent). The start must be copied exactly from a get_open_slots slot. On success the visitor gets a calendar invite by email. If the visitor cancels, do not try again.",
    inputSchema: bookCallInputSchema,
    execute: async (input, { toolCallId }) =>
      runBookCall(ctx, input, toolCallId),
  })
}
