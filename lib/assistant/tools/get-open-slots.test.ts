import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { runGetOpenSlots } from '@/lib/assistant/tools/get-open-slots'

const realFetch = globalThis.fetch
const realWarn = console.warn
const realLog = console.log

beforeEach(() => {
  process.env.BOOKING_PAGE_URL = 'https://tower.example/api/cal/booking/tok/'
  console.log = () => undefined
  console.warn = () => undefined
})

afterEach(() => {
  globalThis.fetch = realFetch
  console.log = realLog
  console.warn = realWarn
  delete process.env.BOOKING_PAGE_URL
})

function slots(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    start: new Date(Date.UTC(2026, 10, 10, 17 + i)).toISOString(),
    end: new Date(Date.UTC(2026, 10, 10, 17 + i, 30)).toISOString(),
  }))
}

describe('runGetOpenSlots', () => {
  test('returns at most 12 slots, soonest first, with the page time zone', async () => {
    const fetchMock = mock(async () =>
      Response.json({
        title: 'Intro call',
        duration_minutes: 30,
        time_zone: 'America/Vancouver',
        slots: slots(20).reverse(),
      })
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await runGetOpenSlots()

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.slots).toHaveLength(12)
    expect(result.data.slots[0]?.start).toBe('2026-11-10T17:00:00.000Z')
    expect(result.data.time_zone).toBe('America/Vancouver')
    expect(result.data.duration_minutes).toBe(30)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toContain('format=json')
    expect((init.headers as Record<string, string>).Accept).toBe(
      'application/json'
    )
  })

  test('says not_configured without BOOKING_PAGE_URL', async () => {
    delete process.env.BOOKING_PAGE_URL

    expect(await runGetOpenSlots()).toMatchObject({
      ok: false,
      code: 'not_configured',
    })
  })

  test('maps a closed page and a dead calendar to plain failures', async () => {
    globalThis.fetch = mock(
      async () => new Response(null, { status: 410 })
    ) as unknown as typeof fetch
    expect(await runGetOpenSlots()).toMatchObject({
      ok: false,
      code: 'page_closed',
    })

    globalThis.fetch = mock(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    expect(await runGetOpenSlots()).toMatchObject({
      ok: false,
      code: 'calendar_unavailable',
    })
  })

  test('rejects an answer in an unexpected shape', async () => {
    globalThis.fetch = mock(async () =>
      Response.json({ hello: 'world' })
    ) as unknown as typeof fetch

    expect(await runGetOpenSlots()).toMatchObject({
      ok: false,
      code: 'calendar_unavailable',
    })
  })
})
