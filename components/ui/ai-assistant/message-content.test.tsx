import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { MessageContent } from './message-content'

describe('MessageContent', () => {
  test('renders bold, emphasis, links, and inline code', () => {
    const html = renderToStaticMarkup(
      <MessageContent
        content={'**Bold** _italic_ `code` [site](https://example.com)'}
      />
    )

    expect(html).toContain('<strong')
    expect(html).toContain('Bold')
    expect(html).toContain('<em')
    expect(html).toContain('italic')
    expect(html).toContain('<code')
    expect(html).toContain('code')
    expect(html).toContain('href="https://example.com"')
  })

  test('renders lists and fenced code blocks', () => {
    const html = renderToStaticMarkup(
      <MessageContent content={'- one\n- two\n\n```ts\nconst x = 1\n```'} />
    )

    expect(html).toContain('<ul')
    expect(html).toContain('<li>one</li>')
    expect(html).toContain('<li>two</li>')
    expect(html).toContain('<pre')
    expect(html).toContain('const x = 1')
  })
})
