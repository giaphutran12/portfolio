'use client'

import cn from 'clsx'
import { useEffect, useRef, useState } from 'react'
import s from './ai-assistant.module.css'
import { ChatPanel, type Message } from './chat-panel'
import { Dog } from './dog'

const BUBBLE_MESSAGES = [
  'ask me anything',
  'do you have a question?',
  'woof woof',
]

const DOG_SIZE = 72
const MARGIN = 16
const STORAGE_KEY = 'edward-portfolio-chat'

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [dogX, setDogX] = useState(0)
  const [dogY, setDogY] = useState(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const dogPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const touchDeviceRef = useRef(false)

  const [bubbleIndex, setBubbleIndex] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  // Load messages from localStorage on mount
  useEffect(() => {
    touchDeviceRef.current = isTouchDevice()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        if (Array.isArray(parsed)) {
          setMessages(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // Initialize dog position at bottom-right
  useEffect(() => {
    if (typeof window === 'undefined') return
    const startX = window.innerWidth - DOG_SIZE - MARGIN
    const startY = window.innerHeight - DOG_SIZE - MARGIN
    setDogX(startX)
    setDogY(startY)
    dogPosRef.current = { x: startX, y: startY }
  }, [])

  // Cursor following with lerp
  useEffect(() => {
    if (typeof window === 'undefined' || touchDeviceRef.current) return

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const tick = () => {
      const targetX = mouseRef.current.x - DOG_SIZE / 2
      const targetY = mouseRef.current.y - DOG_SIZE / 2

      dogPosRef.current.x = lerp(dogPosRef.current.x, targetX, 0.025)
      dogPosRef.current.y = lerp(dogPosRef.current.y, targetY, 0.025)

      // Clamp to viewport
      const maxX = window.innerWidth - DOG_SIZE - MARGIN
      const maxY = window.innerHeight - DOG_SIZE - MARGIN
      dogPosRef.current.x = Math.max(
        MARGIN,
        Math.min(maxX, dogPosRef.current.x)
      )
      dogPosRef.current.y = Math.max(
        MARGIN,
        Math.min(maxY, dogPosRef.current.y)
      )

      setDogX(dogPosRef.current.x)
      setDogY(dogPosRef.current.y)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Bubble cycle
  useEffect(() => {
    if (isOpen) {
      setBubbleVisible(false)
      return
    }

    const showBubble = () => {
      setBubbleIndex((i) => (i + 1) % BUBBLE_MESSAGES.length)
      setBubbleVisible(true)
      setTimeout(() => {
        setBubbleVisible(false)
      }, 2500)
    }

    // Initial delay before first bubble
    const initialTimeout = setTimeout(showBubble, 3500)
    const interval = setInterval(showBubble, 5000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [isOpen])

  const handleSend = async (text: string) => {
    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: text },
    ]
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      const text = await response.text()
      setMessages((prev) => [...prev, { role: 'assistant', content: text }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, my brain is a little fuzzy right now. Try emailing me directly!',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className={s.wrapper}
        style={{
          left: dogX,
          top: dogY,
          width: DOG_SIZE,
          height: DOG_SIZE,
        }}
      >
        <span
          className={cn(s.bubble, bubbleVisible && s.bubbleVisible)}
          aria-hidden="true"
        >
          {BUBBLE_MESSAGES[bubbleIndex]}
        </span>

        <Dog onClick={() => setIsOpen(true)} />
      </div>

      <div className={s.chatPanelWrapper}>
        <ChatPanel
          open={isOpen}
          messages={messages}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
        />
      </div>
    </>
  )
}
