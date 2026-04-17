'use client'

import cn from 'clsx'
import { useEffect, useRef } from 'react'
import s from './ai-assistant.module.css'
import { MessageContent } from './message-content'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  open: boolean
  messages: Message[]
  isLoading: boolean
  onClose: () => void
  onSend: (text: string) => void
}

type ChatScrollState = {
  open: boolean
  messageCount: number
  isLoading: boolean
}

const QUICK_PROMPTS = [
  "What's your stack?",
  'Tell me about X Rec Algo',
  'What did you build at TinyFish?',
  'How can I contact you?',
]

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
    previous.isLoading !== next.isLoading
  )
}

export function ChatPanel({
  open,
  messages,
  isLoading,
  onClose,
  onSend,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousScrollStateRef = useRef<ChatScrollState | undefined>(undefined)

  useEffect(() => {
    const nextState = {
      open,
      messageCount: messages.length,
      isLoading,
    }

    if (shouldAutoScroll(previousScrollStateRef.current, nextState)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    previousScrollStateRef.current = nextState
  }, [open, messages.length, isLoading])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

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
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              s.message,
              message.role === 'user' ? s.messageUser : s.messageAssistant
            )}
          >
            {message.role === 'assistant' ? (
              <MessageContent content={message.content} />
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className={s.quickPrompts}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={s.quickPrompt}
            onClick={() => onSend(prompt)}
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
          placeholder="Ask anything..."
          disabled={isLoading}
          aria-label="Message"
        />
        <button
          type="submit"
          className={s.sendButton}
          disabled={isLoading}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  )
}
