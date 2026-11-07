import { describe, expect, test } from 'bun:test'
import { PROMPT_VERSION } from '@/lib/assistant/instructions'
import { assistantLogLine } from '@/lib/assistant/log'

describe('assistantLogLine', () => {
  test('uses the [ASSISTANT] v=<version> event=<name> k=v shape', () => {
    expect(
      assistantLogLine('turn_done', {
        steps: 2,
        tools: 'get_open_slots',
        ms: 1840,
        finish: 'stop',
      })
    ).toBe(
      `[ASSISTANT] v=${PROMPT_VERSION} event=turn_done steps=2 tools=get_open_slots ms=1840 finish=stop`
    )
  })

  test('redacts anything that is not an id or a label', () => {
    const line = assistantLogLine('x', {
      who: 'ada@example.com',
      text: 'hello there',
    })

    expect(line).toContain('who=redacted')
    expect(line).toContain('text=redacted')
    expect(line).not.toContain('ada@')
  })
})
