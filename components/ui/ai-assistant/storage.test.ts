import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import {
  dropUnsettledTurns,
  LEGACY_STORAGE_KEY,
  loadStoredMessages,
  MAX_STORED_MESSAGES,
  STORAGE_KEY,
  saveMessages,
  trimHistory,
} from './storage'
import type { AssistantUIMessage } from './types'

const globals = globalThis as unknown as Record<string, unknown>
const originalWindow = globals.window
const originalStorage = globals.localStorage
let backing: Map<string, string>

beforeEach(() => {
  backing = new Map()
  globals.window = {}
  globals.localStorage = {
    getItem: (key: string) => backing.get(key) ?? null,
    setItem: (key: string, value: string) => {
      backing.set(key, value)
    },
    removeItem: (key: string) => {
      backing.delete(key)
    },
  }
})

afterEach(() => {
  globals.window = originalWindow
  globals.localStorage = originalStorage
})

function text(
  id: string,
  role: 'user' | 'assistant',
  value: string
): AssistantUIMessage {
  return { id, role, parts: [{ type: 'text', text: value }] }
}

describe('message storage', () => {
  test('uses a new key and removes the old plain-text history', () => {
    backing.set(
      LEGACY_STORAGE_KEY,
      JSON.stringify([{ role: 'user', content: 'old' }])
    )

    expect(loadStoredMessages()).toEqual([])
    expect(backing.has(LEGACY_STORAGE_KEY)).toBe(false)
    expect(STORAGE_KEY).toBe('edward-portfolio-agent-v1')
  })

  test('round-trips saved messages', () => {
    const messages = [
      text('u1', 'user', 'hi'),
      text('a1', 'assistant', 'hello'),
    ]

    saveMessages(messages)

    expect(loadStoredMessages()).toEqual(messages)
  })

  test('ignores corrupt or wrongly shaped data', () => {
    backing.set(STORAGE_KEY, '{nope')
    expect(loadStoredMessages()).toEqual([])

    backing.set(
      STORAGE_KEY,
      JSON.stringify([{ role: 'user', content: 'no parts' }])
    )
    expect(loadStoredMessages()).toEqual([])
  })

  test('drops an assistant turn whose tool call never finished', () => {
    const stuck: AssistantUIMessage = {
      id: 'a2',
      role: 'assistant',
      parts: [
        {
          type: 'tool-show_on_page',
          toolCallId: 'c1',
          state: 'input-available',
          input: { target: 'projects', project: null },
        },
      ],
    }

    expect(dropUnsettledTurns([text('u1', 'user', 'hi'), stuck])).toEqual([
      text('u1', 'user', 'hi'),
    ])
  })

  test('keeps the recent tail, starting on a visitor message', () => {
    const many = Array.from({ length: 50 }, (_, i) =>
      text(`m${i}`, i % 2 === 0 ? 'user' : 'assistant', `m${i}`)
    )

    const trimmed = trimHistory(many)

    expect(trimmed.length).toBeLessThanOrEqual(MAX_STORED_MESSAGES)
    expect(trimmed[0]?.role).toBe('user')
    expect(trimmed.at(-1)?.id).toBe('m49')
  })
})
