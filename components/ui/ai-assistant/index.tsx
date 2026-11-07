'use client'

import { Chat, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import cn from 'clsx'
import type Lenis from 'lenis'
import { useLenis } from 'lenis/react'
import { useEffect, useRef, useState } from 'react'
import s from './ai-assistant.module.css'
import { AnimatedDog } from './animated-dog'
import { ChatPanel } from './chat-panel'
import { hasPendingConfirmation, shouldResend } from './chat-state'
import { getDogTargetPosition } from './dog-motion'
import { showOnPage } from './page-actions'
import { formatSlotTime, slotContextText } from './slot-format'
import {
  dropUnsettledTurns,
  loadStoredMessages,
  saveMessages,
  trimHistory,
} from './storage'
import type { AssistantUIMessage } from './types'

const BUBBLE_MESSAGES = [
  'ask me anything',
  'do you have a question?',
  'woof woof',
]

const DOG_SIZE = 104
const DOG_FOLLOW_DISTANCE = 220
const MARGIN = 16

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const lenis = useLenis()
  const lenisRef = useRef<Lenis | undefined>(undefined)
  const hydratedRef = useRef(false)

  // One Chat for the page's lifetime. Its callbacks are created once, so they
  // read the Lenis instance through a ref instead of closing over it.
  const chatRef = useRef<Chat<AssistantUIMessage> | null>(null)
  if (!chatRef.current) {
    const chat: Chat<AssistantUIMessage> = new Chat<AssistantUIMessage>({
      transport: new DefaultChatTransport<AssistantUIMessage>({
        api: '/api/chat',
        // The server takes at most 40 messages: send the recent, settled tail.
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: trimHistory(messages) },
        }),
      }),
      sendAutomaticallyWhen: shouldResend,
      onToolCall: ({ toolCall }) => {
        if (toolCall.dynamic || toolCall.toolName !== 'show_on_page') return

        const { toolCallId } = toolCall
        // Not awaited on purpose: awaiting addToolOutput inside onToolCall can deadlock.
        showOnPage(toolCall.input, lenisRef.current)
          .then((output) =>
            chat.addToolOutput({ tool: 'show_on_page', toolCallId, output })
          )
          .catch(() =>
            chat.addToolOutput({
              tool: 'show_on_page',
              toolCallId,
              state: 'output-error',
              errorText: 'The page could not be moved.',
            })
          )
      },
      onError: () => {
        // A half-finished turn would make the next request invalid: drop it.
        chat.messages = dropUnsettledTurns(chat.messages)
      },
    })
    chatRef.current = chat
  }

  const {
    messages,
    sendMessage,
    setMessages,
    addToolApprovalResponse,
    status,
    error,
  } = useChat<AssistantUIMessage>({ chat: chatRef.current })
  const isLoading = status === 'submitted' || status === 'streaming'

  const [dogX, setDogX] = useState(0)
  const [dogY, setDogY] = useState(0)
  const [dogState, setDogState] = useState<'idle' | 'walk'>('idle')
  const [dogDirection, setDogDirection] = useState<'left' | 'right'>('right')
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const dogPosRef = useRef({ x: 0, y: 0 })
  const prevDogPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const touchDeviceRef = useRef(false)
  const heroVisibleRef = useRef(true)
  const isFrozenRef = useRef(false)

  const [bubbleIndex, setBubbleIndex] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  useEffect(() => {
    touchDeviceRef.current = isTouchDevice()
  }, [])

  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  // Restore the saved chat after mount (never during render: the server has no
  // localStorage, and a different first render would break hydration).
  useEffect(() => {
    const stored = loadStoredMessages()
    if (stored.length > 0) setMessages(stored)
    hydratedRef.current = true
  }, [setMessages])

  // Persist messages to localStorage once a reply settles
  useEffect(() => {
    if (!hydratedRef.current || isLoading) return
    saveMessages(messages)
  }, [messages, isLoading])

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

  const awaitingConfirmation = hasPendingConfirmation(messages)

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || awaitingConfirmation) return
    void sendMessage({ text: trimmed })
  }

  const handlePickSlot = (startIso: string) => {
    if (isLoading || awaitingConfirmation) return
    // The visitor sees "Book Tue, Nov 10, 9:00 AM PST"; the second part carries
    // the exact instant so the model never has to convert time zones.
    void sendMessage({
      parts: [
        { type: 'text', text: `Book ${formatSlotTime(startIso)}` },
        { type: 'text', text: slotContextText(startIso) },
      ],
    })
  }

  const handleApproval = (approvalId: string, approved: boolean) => {
    void addToolApprovalResponse({ id: approvalId, approved })
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
          hasError={Boolean(error)}
          awaitingConfirmation={awaitingConfirmation}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
          onPickSlot={handlePickSlot}
          onApproval={handleApproval}
        />
      </div>
    </>
  )
}
