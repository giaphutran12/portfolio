import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  approvalForMessageEdward,
  runMessageEdward,
} from '@/lib/assistant/tools/message-edward'

const realFetch = globalThis.fetch
const realLog = console.log
const realWarn = console.warn
let logs: string[] = []
let ipCounter = 0

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    visitor_name: 'Ada Lovelace',
    visitor_email: 'ada@example.com',
    message: 'Loved the Tower demo.',
    ...overrides,
  }
}

function ctx() {
  ipCounter += 1
  return { ip: `198.51.100.${ipCounter}` }
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test_key'
  process.env.CONTACT_FROM_EMAIL = 'Portfolio <site@example.com>'
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
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_FROM_EMAIL
  delete process.env.CONTACT_TO_EMAIL
})

describe('runMessageEdward', () => {
  test('sends through Resend with the visitor as reply-to and logs only the id', async () => {
    const fetchMock = mock(async () => Response.json({ id: 'email_abc' }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await runMessageEdward(ctx(), validInput())

    expect(result).toMatchObject({ ok: true })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer re_test_key'
    )
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: 'Portfolio <site@example.com>',
      to: ['giaphutran012@gmail.com'],
      reply_to: 'ada@example.com',
      subject: 'Portfolio message from Ada Lovelace',
    })
    expect(
      logs.some((line) => line.includes('event=message_sent id=email_abc'))
    ).toBe(true)
    const everything = logs.join('\n')
    expect(everything).not.toContain('ada@example.com')
    expect(everything).not.toContain('Ada')
    expect(everything).not.toContain('Tower demo')
    expect(everything).not.toContain('re_test_key')
  })

  test('honors CONTACT_TO_EMAIL', async () => {
    process.env.CONTACT_TO_EMAIL = 'inbox@example.com'
    const fetchMock = mock(async () => Response.json({ id: 'email_1' }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await runMessageEdward(ctx(), validInput())

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body)).to).toEqual(['inbox@example.com'])
  })

  test('keeps a newline in the name out of the subject line', async () => {
    const fetchMock = mock(async () => Response.json({ id: 'email_1' }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await runMessageEdward(
      ctx(),
      validInput({ visitor_name: 'Ada\nBcc: x@y.z' })
    )

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body)).subject).not.toContain('\n')
  })

  test('without a Resend key it says not_configured and sends nothing', async () => {
    delete process.env.RESEND_API_KEY
    const fetchMock = mock(async () => Response.json({ id: 'x' }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await runMessageEdward(ctx(), validInput())

    expect(result).toMatchObject({ ok: false, code: 'not_configured' })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(
      logs.some((line) =>
        line.includes('event=message_refused reason=not_configured')
      )
    ).toBe(true)
  })

  test('reports a Resend failure as send_failed', async () => {
    globalThis.fetch = mock(
      async () => new Response('nope', { status: 422 })
    ) as unknown as typeof fetch

    const result = await runMessageEdward(ctx(), validInput())

    expect(result).toMatchObject({ ok: false, code: 'send_failed' })
    expect(logs.some((line) => line.includes('reason=upstream_422'))).toBe(true)
  })

  test('refuses a message over 2000 characters', async () => {
    const fetchMock = mock(async () => Response.json({ id: 'x' }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await runMessageEdward(
      ctx(),
      validInput({ message: 'x'.repeat(2001) })
    )

    expect(result).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('allows three actions an hour per IP, then refuses', async () => {
    globalThis.fetch = mock(async () =>
      Response.json({ id: 'email_1' })
    ) as unknown as typeof fetch
    const sameIp = ctx()

    for (let i = 0; i < 3; i += 1) {
      expect(await runMessageEdward(sameIp, validInput())).toMatchObject({
        ok: true,
      })
    }

    expect(await runMessageEdward(sameIp, validInput())).toMatchObject({
      ok: false,
      code: 'rate_limited',
    })
  })
})

describe('approvalForMessageEdward', () => {
  test('asks the visitor to confirm a valid message', () => {
    expect(approvalForMessageEdward(validInput())).toBe('user-approval')
  })

  test('denies a bad email so no card is shown', () => {
    expect(
      approvalForMessageEdward(validInput({ visitor_email: 'nope' }))
    ).toMatchObject({ type: 'denied' })
  })
})
