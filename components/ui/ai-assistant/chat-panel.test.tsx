import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChatPanel, shouldAutoScroll } from './chat-panel'
import { formatSlotTime } from './slot-format'
import type { AssistantUIMessage } from './types'

describe('shouldAutoScroll', () => {
  test('scrolls when panel opens for first time', () => {
    expect(
      shouldAutoScroll(undefined, {
        open: true,
        messageCount: 0,
        isLoading: false,
      })
    ).toBe(true)
  })

  test('does not scroll for unrelated rerenders', () => {
    expect(
      shouldAutoScroll(
        {
          open: true,
          messageCount: 3,
          isLoading: false,
        },
        {
          open: true,
          messageCount: 3,
          isLoading: false,
        }
      )
    ).toBe(false)
  })

  test('scrolls when messages or loading state change while open', () => {
    expect(
      shouldAutoScroll(
        {
          open: true,
          messageCount: 2,
          isLoading: false,
        },
        {
          open: true,
          messageCount: 3,
          isLoading: false,
        }
      )
    ).toBe(true)

    expect(
      shouldAutoScroll(
        {
          open: true,
          messageCount: 3,
          isLoading: true,
        },
        {
          open: true,
          messageCount: 3,
          isLoading: false,
        }
      )
    ).toBe(true)
  })
})

describe('shouldAutoScroll while a reply streams', () => {
  test('scrolls when the newest message gains parts', () => {
    expect(
      shouldAutoScroll(
        { open: true, messageCount: 2, isLoading: true, partCount: 1 },
        { open: true, messageCount: 2, isLoading: true, partCount: 2 }
      )
    ).toBe(true)
  })
})

function assistant(
  id: string,
  parts: AssistantUIMessage['parts']
): AssistantUIMessage {
  return { id, role: 'assistant', parts }
}

function user(id: string, texts: string[]): AssistantUIMessage {
  return {
    id,
    role: 'user',
    parts: texts.map((text) => ({ type: 'text' as const, text })),
  }
}

const SLOT = '2026-11-10T17:00:00.000Z'

function render(messages: AssistantUIMessage[], props = {}) {
  return renderToStaticMarkup(
    <ChatPanel
      open
      messages={messages}
      isLoading={false}
      onClose={() => undefined}
      onSend={() => undefined}
      {...props}
    />
  )
}

describe('ChatPanel nested scroll escape hatch', () => {
  test('marks panel and message area with Lenis prevent attributes', () => {
    const html = render([
      assistant('a1', [{ type: 'text', text: 'Hello' }]),
      user('u1', ['Hi']),
    ])

    expect(html).toContain('data-lenis-prevent=""')
  })

  test('hides focusable controls from keyboard access when closed and loading', () => {
    const html = renderToStaticMarkup(
      <ChatPanel
        open={false}
        messages={[assistant('a1', [{ type: 'text', text: 'Hello' }])]}
        isLoading
        onClose={() => undefined}
        onSend={() => undefined}
      />
    )

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('inert=""')
    expect(html).toContain('disabled=""')
  })
})

describe('ChatPanel agent messages', () => {
  test('offers the four quick prompts', () => {
    const html = render([])

    for (const prompt of [
      'What is Tower?',
      'What&#x27;s Edward building right now?',
      'Show me his best project',
      'Book a call with Edward',
    ]) {
      expect(html).toContain(prompt)
    }
  })

  test('shows open slots as buttons in the visitor local time', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-get_open_slots',
          toolCallId: 'c1',
          state: 'output-available',
          input: {},
          output: {
            ok: true,
            data: {
              title: 'Intro call',
              duration_minutes: 30,
              time_zone: 'America/Vancouver',
              slots: [{ start: SLOT, end: '2026-11-10T17:30:00.000Z' }],
            },
          },
        },
      ]),
    ])

    expect(html).toContain(formatSlotTime(SLOT))
    expect(html).toContain('<button')
    expect(html).not.toContain('time_zone')
    expect(html).not.toContain('"ok"')
  })

  test('shows a short line while a tool is running', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-get_open_slots',
          toolCallId: 'c1',
          state: 'input-available',
          input: {},
        },
      ]),
    ])

    expect(html).toContain('Checking Edward&#x27;s calendar')
  })

  test('draws a confirm card with exactly what will be booked', () => {
    const html = render(
      [
        assistant('a1', [
          {
            type: 'tool-book_call',
            toolCallId: 'c1',
            state: 'approval-requested',
            input: {
              start: SLOT,
              guest_name: 'Ada Lovelace',
              guest_email: 'ada@example.com',
              note: 'Intro chat',
            },
            approval: { id: 'ap1' },
          },
        ]),
      ],
      { awaitingConfirmation: true }
    )

    expect(html).toContain('Book a call with Edward')
    expect(html).toContain('Ada Lovelace')
    expect(html).toContain('ada@example.com')
    expect(html).toContain('Intro chat')
    expect(html).toContain(formatSlotTime(SLOT))
    expect(html).toContain('Confirm booking')
    expect(html).toContain('Cancel')
    expect(html).toContain('Confirm or cancel above')
  })

  test('draws the exact message in the send card', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-message_edward',
          toolCallId: 'c1',
          state: 'approval-requested',
          input: {
            visitor_name: 'Ada',
            visitor_email: 'ada@example.com',
            message: 'Loved the Tower demo.',
          },
          approval: { id: 'ap1' },
        },
      ]),
    ])

    expect(html).toContain('Send this message to Edward')
    expect(html).toContain('Loved the Tower demo.')
    expect(html).toContain('>Send message</button>')
  })

  test('draws no card for an automatic denial', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-message_edward',
          toolCallId: 'c1',
          state: 'approval-requested',
          input: { visitor_name: 'A', visitor_email: 'bad', message: 'Hi' },
          approval: { id: 'ap1', isAutomatic: true },
        },
      ]),
    ])

    expect(html).not.toContain('Send this message to Edward')
    expect(html).toContain('Checking the details')
  })

  test('ends in a one-line receipt, never raw JSON', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-message_edward',
          toolCallId: 'c1',
          state: 'output-available',
          input: {
            visitor_name: 'Ada',
            visitor_email: 'ada@example.com',
            message: 'Hello',
          },
          approval: { id: 'ap1', approved: true },
          output: { ok: true, data: { note: 'internal note for the model' } },
        },
      ]),
    ])

    expect(html).toContain('Message sent to Edward.')
    expect(html).not.toContain('internal note')
    expect(html).not.toContain('{')
  })

  test('turns a refused booking into a neutral line, not the model message', () => {
    const html = render([
      assistant('a1', [
        {
          type: 'tool-book_call',
          toolCallId: 'c1',
          state: 'output-available',
          input: {
            start: SLOT,
            guest_name: 'Ada',
            guest_email: 'ada@example.com',
            note: null,
          },
          approval: { id: 'ap1', approved: true },
          output: {
            ok: false,
            code: 'slot_taken',
            message_for_model: 'Call get_open_slots again.',
          },
        },
      ]),
    ])

    expect(html).toContain('That time was just taken')
    expect(html).not.toContain('get_open_slots')
  })

  test('hides the slot context part of a chip click from the visitor', () => {
    const html = render([
      user('u1', ['Book Tue, Nov 10, 9:00 AM PST', `[slot start=${SLOT}]`]),
    ])

    expect(html).toContain('Book Tue, Nov 10, 9:00 AM PST')
    expect(html).not.toContain('slot start')
  })

  test('shows a neutral error line when the request failed', () => {
    const html = render([user('u1', ['Hi'])], { hasError: true })

    expect(html).toContain('Something went wrong')
  })
})
