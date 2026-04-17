import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChatPanel, shouldAutoScroll } from './chat-panel'

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

describe('ChatPanel nested scroll escape hatch', () => {
  test('marks panel and message area with Lenis prevent attributes', () => {
    const html = renderToStaticMarkup(
      <ChatPanel
        open
        messages={[
          { role: 'assistant', content: 'Hello' },
          { role: 'user', content: 'Hi' },
        ]}
        isLoading={false}
        onClose={() => undefined}
        onSend={() => undefined}
      />
    )

    expect(html).toContain('data-lenis-prevent=""')
  })
})
