import { describe, expect, test } from 'bun:test'
import { hasPendingConfirmation, shouldResend } from './chat-state'
import type { AssistantUIMessage } from './types'

const SLOTS_OUTPUT = {
  ok: true as const,
  data: {
    title: 'Intro call',
    duration_minutes: 30,
    time_zone: 'America/Vancouver',
    slots: [],
  },
}

const MESSAGE_INPUT = {
  visitor_name: 'Ada',
  visitor_email: 'ada@example.com',
  message: 'Hello',
}

function assistant(parts: AssistantUIMessage['parts']): AssistantUIMessage {
  return { id: 'a1', role: 'assistant', parts }
}

describe('shouldResend', () => {
  test('does not resend after a server tool finished inside the stream', () => {
    const messages = [
      assistant([
        { type: 'step-start' },
        {
          type: 'tool-get_open_slots',
          toolCallId: 'c1',
          state: 'output-available',
          input: {},
          output: SLOTS_OUTPUT,
        },
      ]),
    ]

    expect(shouldResend({ messages })).toBe(false)
  })

  test('resends once the browser reported a show_on_page result', () => {
    const messages = [
      assistant([
        { type: 'step-start' },
        {
          type: 'tool-show_on_page',
          toolCallId: 'c1',
          state: 'output-available',
          input: { target: 'projects', project: null },
          output: { shown: true, detail: 'Scrolled to the Projects section.' },
        },
      ]),
    ]

    expect(shouldResend({ messages })).toBe(true)
  })

  test('waits while show_on_page has no result yet', () => {
    const messages = [
      assistant([
        { type: 'step-start' },
        {
          type: 'tool-show_on_page',
          toolCallId: 'c1',
          state: 'input-available',
          input: { target: 'projects', project: null },
        },
      ]),
    ]

    expect(shouldResend({ messages })).toBe(false)
  })

  test('resends once a confirm card was answered, and not before', () => {
    const asked = assistant([
      { type: 'step-start' },
      {
        type: 'tool-message_edward',
        toolCallId: 'c1',
        state: 'approval-requested',
        input: MESSAGE_INPUT,
        approval: { id: 'ap1' },
      },
    ])
    const answered = assistant([
      { type: 'step-start' },
      {
        type: 'tool-message_edward',
        toolCallId: 'c1',
        state: 'approval-responded',
        input: MESSAGE_INPUT,
        approval: { id: 'ap1', approved: false },
      },
    ])

    expect(shouldResend({ messages: [asked] })).toBe(false)
    expect(shouldResend({ messages: [answered] })).toBe(true)
  })
})

describe('hasPendingConfirmation', () => {
  test('is true only for a manual card that is still waiting', () => {
    const waiting = assistant([
      {
        type: 'tool-message_edward',
        toolCallId: 'c1',
        state: 'approval-requested',
        input: MESSAGE_INPUT,
        approval: { id: 'ap1' },
      },
    ])
    const automatic = assistant([
      {
        type: 'tool-message_edward',
        toolCallId: 'c1',
        state: 'approval-requested',
        input: MESSAGE_INPUT,
        approval: { id: 'ap1', isAutomatic: true },
      },
    ])

    expect(hasPendingConfirmation([waiting])).toBe(true)
    expect(hasPendingConfirmation([automatic])).toBe(false)
    expect(hasPendingConfirmation([])).toBe(false)
  })
})
