'use client'

import cn from 'clsx'
import { useEffect, useRef, useState } from 'react'
import s from './ai-assistant.module.css'
import { AnimatedDog } from './animated-dog'
import { ChatPanel, type Message } from './chat-panel'
import { getDogTargetPosition } from './dog-motion'

const BUBBLE_MESSAGES = [
  'ask me anything',
  'do you have a question?',
  'woof woof',
]

const DOG_SIZE = 104
const DOG_FOLLOW_DISTANCE = 220
const MARGIN = 16
const STORAGE_KEY = 'edward-portfolio-chat'

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function getStoredMessages(): Message[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved) as Message[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(getStoredMessages)
  const [isLoading, setIsLoading] = useState(false)

  const [dogX, setDogX] = useState(0)
  const [dogY, setDogY] = useState(0)
  const [dogState, setDogState] = useState<'idle' | 'walk'>('idle')
  const [dogDirection, setDogDirection] = useState<'left' | 'right'>('right')
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const dogPosRef = useRef({ x: 0, y: 0 })
  const prevDogPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const touchDeviceRef = useRef(false)
  const messagesRef = useRef<Message[]>(messages)
  const isSendingRef = useRef(false)
  const heroVisibleRef = useRef(true)
  const isFrozenRef = useRef(false)

  const [bubbleIndex, setBubbleIndex] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  useEffect(() => {
    touchDeviceRef.current = isTouchDevice()
  }, [])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

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

  // Track hero section visibility
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          heroVisibleRef.current = entry.intersectionRatio > 0.5
        }
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  // Cursor following with lerp
  useEffect(() => {
    if (typeof window === 'undefined' || touchDeviceRef.current) return

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
      if (mouseRef.current.px === 0 && mouseRef.current.py === 0) {
        mouseRef.current.px = event.clientX
        mouseRef.current.py = event.clientY
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const tick = () => {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      if (mouseRef.current.px === 0 && mouseRef.current.py === 0) {
        mouseRef.current.px = mx
        mouseRef.current.py = my
      }

      const velX = mx - mouseRef.current.px
      const velY = my - mouseRef.current.py
      const speed = Math.hypot(velX, velY)

      mouseRef.current.px = mx
      mouseRef.current.py = my

      const dogCenterX = dogPosRef.current.x + DOG_SIZE / 2
      const dogCenterY = dogPosRef.current.y + DOG_SIZE / 2
      const toDogX = dogCenterX - mx
      const toDogY = dogCenterY - my
      const distToDog = Math.hypot(toDogX, toDogY)

      // Freeze when cursor moves directly toward the dog so it can be clicked
      // Also freeze when cursor is very close regardless of direction
      if (distToDog < 160) {
        isFrozenRef.current = true
      } else if (speed > 1.5 && distToDog > 0 && distToDog < 400) {
        const velNormX = velX / speed
        const velNormY = velY / speed
        const toDogNormX = toDogX / distToDog
        const toDogNormY = toDogY / distToDog
        const dot = velNormX * toDogNormX + velNormY * toDogNormY
        if (dot > 0.65) {
          isFrozenRef.current = true
        } else if (dot < 0.3) {
          isFrozenRef.current = false
        }
      } else if (speed <= 0.8) {
        isFrozenRef.current = false
      }

      const { x: targetX, y: targetY } = getDogTargetPosition({
        dogSize: DOG_SIZE,
        dogX: dogPosRef.current.x,
        dogY: dogPosRef.current.y,
        followDistance: DOG_FOLLOW_DISTANCE,
        frozen: isFrozenRef.current,
        heroVisible: heroVisibleRef.current,
        margin: MARGIN,
        mouseX: mx,
        mouseY: my,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      })

      // Lerp factor: faster when returning to idle, slower when following
      const lerpFactor = heroVisibleRef.current ? 0.04 : 0.02

      prevDogPosRef.current = { ...dogPosRef.current }

      dogPosRef.current.x = lerp(dogPosRef.current.x, targetX, lerpFactor)
      dogPosRef.current.y = lerp(dogPosRef.current.y, targetY, lerpFactor)

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

      // Update animation state based on movement
      const moveX = dogPosRef.current.x - prevDogPosRef.current.x
      const moveY = dogPosRef.current.y - prevDogPosRef.current.y
      const moveSpeed = Math.hypot(moveX, moveY)

      if (moveSpeed > 0.3) {
        setDogState('walk')
        setDogDirection(moveX > 0 ? 'right' : 'left')
      } else {
        setDogState('idle')
      }

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
    const trimmed = text.trim()
    if (!trimmed || isSendingRef.current) return

    isSendingRef.current = true

    const userMessage: Message = { role: 'user', content: trimmed }
    const nextMessages: Message[] = [...messagesRef.current, userMessage]
    messagesRef.current = nextMessages
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
      setMessages((prev) => {
        const assistantMessage: Message = { role: 'assistant', content: text }
        const updated = [...prev, assistantMessage]
        messagesRef.current = updated
        return updated
      })
    } catch {
      setMessages((prev) => {
        const fallbackMessage: Message = {
          role: 'assistant',
          content:
            'Sorry, my brain is a little fuzzy right now. Try emailing me directly!',
        }
        const updated = [...prev, fallbackMessage]
        messagesRef.current = updated
        return updated
      })
    } finally {
      setIsLoading(false)
      isSendingRef.current = false
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

        <AnimatedDog
          state={dogState}
          direction={dogDirection}
          onClick={() => setIsOpen(true)}
        />
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
