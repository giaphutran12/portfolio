import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  approvalForBookCall,
  runBookCall,
} from '@/lib/assistant/tools/book-call'

const PAGE = 'https://tower.example/api/cal/booking/super-secret-token'
const SLOT = '2026-11-10T17:00:00.000Z'

const realFetch = globalThis.fetch
const realLog = console.log
const realWarn = console.warn
let logs: string[] = []
let ipCounter = 0

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    start: SLOT,
    guest_name: 'Ada Lovelace',
    guest_email: 'ada@example.com',
    note: null,
    ...overrides,
  }
}

function ctx() {
  ipCounter += 1
  return { ip: `192.0.2.${ipCounter}` }
}

/** Answers the page GET and the reservation POST; records every call. */
function mockCalendar(reserve: () => Response) {
  const calls: { url: string; method: string; body: unknown }[] = []
  globalThis.fetch = mock(
    async (url: string | URL | Request, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      calls.push({
        url: String(url),
        method,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      })
      if (method === 'GET') {
        return Response.json({
          title: 'Intro call',
          duration_minutes: 30,
          time_zone: 'America/Vancouver',
          slots: [{ start: SLOT, end: '2026-11-10T17:30:00.000Z' }],
        })
      }
      return reserve()
    }
  ) as unknown as typeof fetch
  return calls
}

beforeEach(() => {
  process.env.BOOKING_PAGE_URL = PAGE
  logs = []
  console.log = (...args: unknown[]) => {
    logs.push(args.join(' '))
  }
  console.warn = (...args: unknown[]) => {
    logs.push(args.join(' '))
  }
})

afterEach(() => {
  globalThis.fetch = realFetch
  console.log = realLog
  console.warn = realWarn
  delete process.env.BOOKING_PAGE_URL
})

describe('runBookCall', () => {
  test('books the slot on 201 and never exposes the manage link', async () => {
    const calls = mockCalendar(() =>
      Response.json(
        {
          reservation: { id: 'r1' },
          manage_token: 'tok_manage_secret',
          manage_url: 'https://tower.example/manage/tok_manage_secret',
        },
        { status: 201 }
      )
    )

    const result = await runBookCall(
      ctx(),
      validInput({ note: 'Intro chat' }),
      'call_abc'
    )

    expect(result).toEqual({
      ok: true,
      data: { start: SLOT, note: expect.any(String) },
    })
    const post = calls.find((call) => call.method === 'POST')
    expect(post?.url).toBe(`${PAGE}/reservations`)
    expect(post?.body).toEqual({
      start: SLOT,
      guest_name: 'Ada Lovelace',
      guest_email: 'ada@example.com',
      note: 'Intro chat',
      request_key: 'call_abc',
    })
    const everything = JSON.stringify(result) + logs.join('\n')
    expect(everything).not.toContain('manage')
    expect(everything).not.toContain('super-secret-token')
    expect(everything).not.toContain('ada@example.com')
    expect(logs.some((line) => line.includes('event=booking_created'))).toBe(
      true
    )
  })

  test('409 means the slot was taken', async () => {
    mockCalendar(() => Response.json({ code: 'slot_taken' }, { status: 409 }))

    const result = await runBookCall(ctx(), validInput(), 'call_1')

    expect(result).toMatchObject({ ok: false, code: 'slot_taken' })
    expect(
      logs.some((line) =>
        line.includes('event=booking_refused reason=slot_taken')
      )
    ).toBe(true)
  })

  test('429 means the guest hit the booking limit', async () => {
    mockCalendar(() => Response.json({ code: 'guest_limit' }, { status: 429 }))

    expect(await runBookCall(ctx(), validInput(), 'call_1')).toMatchObject({
      ok: false,
      code: 'guest_limit',
    })
  })

  test('410 means the booking page is closed', async () => {
    mockCalendar(() => Response.json({ code: 'page_closed' }, { status: 410 }))

    expect(await runBookCall(ctx(), validInput(), 'call_1')).toMatchObject({
      ok: false,
      code: 'page_closed',
    })
  })

  test('an unexpected status is reported without booking', async () => {
    mockCalendar(() => new Response('boom', { status: 500 }))

    const result = await runBookCall(ctx(), validInput(), 'call_1')

    expect(result).toMatchObject({ ok: false, code: 'calendar_unavailable' })
    expect(logs.some((line) => line.includes('reason=upstream_500'))).toBe(true)
  })

  test('without BOOKING_PAGE_URL it refuses and calls nothing', async () => {
    delete process.env.BOOKING_PAGE_URL
    const calls = mockCalendar(() => new Response(null, { status: 201 }))

    const result = await runBookCall(ctx(), validInput(), 'call_1')

    expect(result).toMatchObject({ ok: false, code: 'not_configured' })
    expect(calls).toHaveLength(0)
  })

  test('refuses a time the calendar does not offer', async () => {
    const calls = mockCalendar(() => new Response(null, { status: 201 }))

    const result = await runBookCall(
      ctx(),
      validInput({ start: '2026-11-11T17:00:00.000Z' }),
      'call_1'
    )

    expect(result).toMatchObject({ ok: false, code: 'slot_unavailable' })
    expect(calls.some((call) => call.method === 'POST')).toBe(false)
  })

  test('refuses an invalid email before any network call', async () => {
    const calls = mockCalendar(() => new Response(null, { status: 201 }))

    const result = await runBookCall(
      ctx(),
      validInput({ guest_email: 'nope' }),
      'call_1'
    )

    expect(result).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(calls).toHaveLength(0)
  })

  test('allows three actions an hour per IP, then refuses', async () => {
    mockCalendar(() => Response.json({ reservation: {} }, { status: 201 }))
    const sameIp = ctx()

    for (let i = 0; i < 3; i += 1) {
      expect(
        await runBookCall(sameIp, validInput(), `call_${i}`)
      ).toMatchObject({ ok: true })
    }
    const fourth = await runBookCall(sameIp, validInput(), 'call_4')

    expect(fourth).toMatchObject({ ok: false, code: 'rate_limited' })
    expect(
      logs.some((line) => line.includes('event=rate_limited scope=action'))
    ).toBe(true)
  })
})

describe('approvalForBookCall', () => {
  test('asks the visitor to confirm a valid booking', () => {
    expect(approvalForBookCall(validInput())).toBe('user-approval')
  })

  test('denies a malformed booking so no card is shown', () => {
    expect(approvalForBookCall(validInput({ guest_email: 'x' }))).toMatchObject(
      {
        type: 'denied',
      }
    )
  })
})
