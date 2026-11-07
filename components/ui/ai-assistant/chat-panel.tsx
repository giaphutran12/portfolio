'use client'

import cn from 'clsx'
import { useEffect, useRef } from 'react'
import s from './ai-assistant.module.css'
import { MessageContent } from './message-content'
import { isSlotContextText } from './slot-format'
import { ToolPartView } from './tool-parts'
import type { AssistantMessagePart, AssistantUIMessage } from './types'

interface ChatPanelProps {
  open: boolean
  messages: AssistantUIMessage[]
  /** A reply is on its way (sent or streaming). */
  isLoading: boolean
  /** The last request failed. */
  hasError?: boolean
  /** A confirm card is waiting for Confirm or Cancel. */
  awaitingConfirmation?: boolean
  onClose: () => void
  onSend: (text: string) => void
  onPickSlot?: (startIso: string) => void
  onApproval?: (approvalId: string, approved: boolean) => void
}

type ChatScrollState = {
  open: boolean
  messageCount: number
  isLoading: boolean
  /** Parts in the newest message: grows as a reply streams in. */
  partCount?: number
}

const QUICK_PROMPTS = [
  'What is Tower?',
  "What's Edward building right now?",
  'Show me his best project',
  'Book a call with Edward',
]

function isToolPart(
  part: AssistantMessagePart
): part is Extract<AssistantMessagePart, { type: `tool-${string}` }> {
  return part.type.startsWith('tool-')
}

function hasVisibleContent(message: AssistantUIMessage | undefined) {
  if (!message) return false
  return message.parts.some(
    (part) =>
      (part.type === 'text' && part.text.trim().length > 0) || isToolPart(part)
  )
}

function userText(message: AssistantUIMessage): string {
  return message.parts
    .flatMap((part) =>
      part.type === 'text' && !isSlotContextText(part.text) ? [part.text] : []
    )
    .join('\n')
}

function TypingIndicator() {
  return (
    <div className={cn(s.message, s.messageAssistant)}>
      <div className={s.typingIndicator}>
        <span className={s.typingDot} />
        <span className={s.typingDot} />
        <span className={s.typingDot} />
      </div>
    </div>
  )
}

export function shouldAutoScroll(
  previous: ChatScrollState | undefined,
  next: ChatScrollState
) {
  if (!next.open) {
    return false
  }

  if (!previous) {
    return true
  }

  return (
    (!previous.open && next.open) ||
    previous.messageCount !== next.messageCount ||
    previous.isLoading !== next.isLoading ||
    previous.partCount !== next.partCount
  )
}

export function ChatPanel({
  open,
  messages,
  isLoading,
  hasError = false,
  awaitingConfirmation = false,
  onClose,
  onSend,
  onPickSlot = () => undefined,
  onApproval = () => undefined,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousScrollStateRef = useRef<ChatScrollState | undefined>(undefined)

  const lastMessage = messages[messages.length - 1]
  const partCount = lastMessage?.parts.length ?? 0

  useEffect(() => {
    const nextState = {
      open,
      messageCount: messages.length,
      isLoading,
      partCount,
    }

    if (shouldAutoScroll(previousScrollStateRef.current, nextState)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    previousScrollStateRef.current = nextState
  }, [open, messages.length, isLoading, partCount])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const inputLocked = isLoading || awaitingConfirmation
  const showTyping =
    isLoading &&
    !(lastMessage?.role === 'assistant' && hasVisibleContent(lastMessage))

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = inputRef.current?.value.trim()
    if (!text) return
    onSend(text)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(s.chatPanel, open && s.chatPanelOpen)}
      aria-hidden={!open}
      inert={!open}
      data-lenis-prevent=""
    >
      <div className={s.chatHeader}>
        <h3 className={s.chatTitle}>Ask Edward&apos;s AI</h3>
        <button
          type="button"
          className={s.chatClose}
          onClick={onClose}
          aria-label="Close chat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className={s.messages} data-lenis-prevent="">
        {messages.map((message) => {
          if (message.role === 'user') {
            const text = userText(message)
            if (!text) return null
            return (
              <div key={message.id} className={cn(s.message, s.messageUser)}>
                {text}
              </div>
            )
          }

          if (!hasVisibleContent(message)) return null

          return (
            <div key={message.id} className={s.assistantTurn}>
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  if (!part.text.trim()) return null
                  return (
                    <div
                      key={`${message.id}-text-${index}`}
                      className={cn(s.message, s.messageAssistant)}
                    >
                      <MessageContent content={part.text} />
                    </div>
                  )
                }
                if (isToolPart(part)) {
                  return (
                    <ToolPartView
                      key={part.toolCallId}
                      part={part}
                      busy={isLoading}
                      onApproval={onApproval}
                      onPickSlot={onPickSlot}
                    />
                  )
                }
                return null
              })}
            </div>
          )
        })}
        {showTyping && <TypingIndicator />}
        {hasError && !isLoading && (
          <p className={s.errorLine} role="alert">
            Something went wrong on my side. Try again, or use the contact
            section below.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={s.quickPrompts}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={s.quickPrompt}
            onClick={() => onSend(prompt)}
            disabled={inputLocked}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className={s.inputArea} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className={s.input}
          placeholder={
            awaitingConfirmation
              ? 'Confirm or cancel above…'
              : 'Ask anything...'
          }
          disabled={inputLocked}
          maxLength={1000}
          aria-label="Message"
        />
        <button
          type="submit"
          className={s.sendButton}
          disabled={inputLocked}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  )
}
