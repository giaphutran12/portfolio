'use client'

import type { ReactNode } from 'react'
import { Link } from '@/components/ui/link'
import s from './ai-assistant.module.css'

type Block =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'code'; content: string }

const ORDERED_LIST_PATTERN = /^\d+\.\s+/
const UNORDERED_LIST_PATTERN = /^[-*]\s+/
const INLINE_PATTERN =
  /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(__(.+?)__)|(`([^`]+)`)|(\*([^*\n]+)\*)|(_([^_\n]+)_)/g

function parseBlocks(content: string): Block[] {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const lines = normalized.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''

    if (!line.trim()) {
      i += 1
      continue
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i += 1

      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        codeLines.push(lines[i] ?? '')
        i += 1
      }

      if (i < lines.length && (lines[i] ?? '').startsWith('```')) {
        i += 1
      }

      blocks.push({ type: 'code', content: codeLines.join('\n') })
      continue
    }

    if (ORDERED_LIST_PATTERN.test(line) || UNORDERED_LIST_PATTERN.test(line)) {
      const ordered = ORDERED_LIST_PATTERN.test(line)
      const items: string[] = []

      while (i < lines.length) {
        const current = lines[i] ?? ''
        if (!current.trim()) break

        if (ordered && ORDERED_LIST_PATTERN.test(current)) {
          items.push(current.replace(ORDERED_LIST_PATTERN, ''))
          i += 1
          continue
        }

        if (!ordered && UNORDERED_LIST_PATTERN.test(current)) {
          items.push(current.replace(UNORDERED_LIST_PATTERN, ''))
          i += 1
          continue
        }

        break
      }

      blocks.push({ type: 'list', items, ordered })
      continue
    }

    const paragraphLines = [line]
    i += 1

    while (i < lines.length) {
      const current = lines[i] ?? ''
      if (!current.trim()) break
      if (current.startsWith('```')) break
      if (
        ORDERED_LIST_PATTERN.test(current) ||
        UNORDERED_LIST_PATTERN.test(current)
      ) {
        break
      }

      paragraphLines.push(current)
      i += 1
    }

    blocks.push({ type: 'paragraph', content: paragraphLines.join('\n') })
  }

  return blocks
}

function renderInline(content: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of content.matchAll(INLINE_PATTERN)) {
    const fullMatch = match[0]
    const start = match.index ?? 0

    if (start > lastIndex) {
      nodes.push(content.slice(lastIndex, start))
    }

    if (match[2] && match[3]) {
      nodes.push(
        <Link
          key={`${start}-link`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className={s.messageLink}
        >
          {renderInline(match[2])}
        </Link>
      )
    } else if (match[5]) {
      nodes.push(
        <strong key={`${start}-strong-a`} className={s.messageStrong}>
          {renderInline(match[5])}
        </strong>
      )
    } else if (match[7]) {
      nodes.push(
        <strong key={`${start}-strong-b`} className={s.messageStrong}>
          {renderInline(match[7])}
        </strong>
      )
    } else if (match[9]) {
      nodes.push(
        <code key={`${start}-code`} className={s.inlineCode}>
          {match[9]}
        </code>
      )
    } else if (match[11]) {
      nodes.push(
        <em key={`${start}-em-a`} className={s.messageEmphasis}>
          {renderInline(match[11])}
        </em>
      )
    } else if (match[13]) {
      nodes.push(
        <em key={`${start}-em-b`} className={s.messageEmphasis}>
          {renderInline(match[13])}
        </em>
      )
    }

    lastIndex = start + fullMatch.length
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex))
  }

  return nodes
}

export function MessageContent({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  if (blocks.length === 0) {
    return null
  }

  return (
    <div className={s.messageBody}>
      {blocks.map((block) => {
        if (block.type === 'code') {
          return (
            <pre key={`code-${block.content}`} className={s.codeBlock}>
              <code>{block.content}</code>
            </pre>
          )
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          const listKey = `${block.ordered ? 'ordered' : 'unordered'}-${block.items.join('|')}`

          return (
            <ListTag key={listKey} className={s.messageList}>
              {block.items.map((item) => (
                <li key={`${listKey}-${item}`}>{renderInline(item)}</li>
              ))}
            </ListTag>
          )
        }

        return (
          <p key={`paragraph-${block.content}`} className={s.messageParagraph}>
            {block.content.split('\n').map((line, lineIndex) => (
              <span key={`${block.content}-${line}`}>
                {lineIndex > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
