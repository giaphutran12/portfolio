'use client'

import { gsap } from 'gsap'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Image } from '@/components/ui/image'
import { lerp } from '@/utils/math'
import s from './hover-image-reveal.module.css'

// Module-level: ensures only one preview is active across all instances
let dismissActivePreview: (() => void) | null = null

interface HoverImageRevealProps {
  src: string
  alt: string
  children: ReactNode
}

interface RenderedAxis {
  previous: number
  current: number
  amt: number
}

interface RenderedStyles {
  tx: RenderedAxis
  ty: RenderedAxis
}

const CURSOR_OFFSET_X = 20
const CURSOR_OFFSET_Y = -20

export function HoverImageReveal({
  src,
  alt,
  children,
}: HoverImageRevealProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef(0)
  const firstCycleRef = useRef(false)
  const isHoveredRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)
  const triggerBoundsRef = useRef<DOMRect | null>(null)
  const previewSizeRef = useRef({ width: 400, height: 250 })
  const [isMounted, setIsMounted] = useState(false)
  const renderedStylesRef = useRef<RenderedStyles>({
    tx: { previous: 0, current: 0, amt: 0.08 },
    ty: { previous: 0, current: 0, amt: 0.08 },
  })
  const preloadedRef = useRef(false)
  const lastTapTimeRef = useRef(0)
  const isTouchRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    preloadedRef.current = false

    const wrapperEl = wrapperRef.current
    if (!wrapperEl) return

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    prefersReducedMotionRef.current = reducedMotionQuery.matches

    isTouchRef.current =
      'ontouchstart' in window || navigator.maxTouchPoints > 0

    let documentTapHandler: ((e: TouchEvent) => void) | null = null

    function handleReducedMotionChange(event: MediaQueryListEvent) {
      prefersReducedMotionRef.current = event.matches
    }

    function scheduleRender() {
      if (rafIdRef.current !== 0) return

      rafIdRef.current = requestAnimationFrame(render)
    }

    function stopRenderLoop() {
      if (rafIdRef.current === 0) return

      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }

    function setCurrentPosition(clientX: number, clientY: number) {
      const styles = renderedStylesRef.current
      const x = clientX - previewSizeRef.current.width / 2 + CURSOR_OFFSET_X
      const y = clientY - previewSizeRef.current.height / 2 + CURSOR_OFFSET_Y

      styles.tx.current = x
      styles.ty.current = y

      if (prefersReducedMotionRef.current) {
        styles.tx.previous = x
        styles.ty.previous = y
      }
    }

    function updatePreviewSize() {
      const previewEl = previewRef.current
      if (!previewEl) return

      const bounds = previewEl.getBoundingClientRect()
      previewSizeRef.current = {
        width: bounds.width || previewSizeRef.current.width,
        height: bounds.height || previewSizeRef.current.height,
      }
    }

    function showPreview() {
      const previewEl = previewRef.current
      if (!previewEl) return

      gsap.killTweensOf(previewEl)
      previewEl.style.willChange = 'transform'

      if (prefersReducedMotionRef.current) {
        gsap.set(previewEl, { opacity: 1, scale: 1 })
        return
      }

      gsap.to(previewEl, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    function hidePreview() {
      const previewEl = previewRef.current
      if (!previewEl) return

      isHoveredRef.current = false
      stopRenderLoop()

      gsap.killTweensOf(previewEl)
      previewEl.style.willChange = ''

      if (prefersReducedMotionRef.current) {
        gsap.set(previewEl, { opacity: 0, scale: 0.85 })
        if (dismissActivePreview === hidePreview) {
          dismissActivePreview = null
        }
        return
      }

      gsap.to(previewEl, {
        opacity: 0,
        scale: 0.85,
        duration: 0.2,
        ease: 'power2.in',
      })

      if (dismissActivePreview === hidePreview) {
        dismissActivePreview = null
      }
    }

    function render() {
      rafIdRef.current = 0

      if (!isHoveredRef.current) return

      const previewEl = previewRef.current
      if (!previewEl) return

      const styles = renderedStylesRef.current

      if (firstCycleRef.current) {
        styles.tx.previous = styles.tx.current
        styles.ty.previous = styles.ty.current
        firstCycleRef.current = false
      } else {
        styles.tx.previous = lerp(
          styles.tx.previous,
          styles.tx.current,
          styles.tx.amt
        )
        styles.ty.previous = lerp(
          styles.ty.previous,
          styles.ty.current,
          styles.ty.amt
        )
      }

      gsap.set(previewEl, {
        x: styles.tx.previous,
        y: styles.ty.previous,
      })

      scheduleRender()
    }

    function handleMouseMove(event: MouseEvent) {
      const triggerBounds = triggerBoundsRef.current
      if (!triggerBounds) return

      const clampedClientX =
        triggerBounds.left + (event.clientX - triggerBounds.left)
      const clampedClientY =
        triggerBounds.top + (event.clientY - triggerBounds.top)

      setCurrentPosition(clampedClientX, clampedClientY)

      if (prefersReducedMotionRef.current) {
        const previewEl = previewRef.current
        if (!previewEl) return

        gsap.set(previewEl, {
          x: renderedStylesRef.current.tx.current,
          y: renderedStylesRef.current.ty.current,
        })
      }
    }

    function handleMouseEnter(event: MouseEvent) {
      if (!preloadedRef.current) {
        const img = new window.Image()
        img.src = src
        preloadedRef.current = true
      }

      const currentWrapper = wrapperRef.current
      const previewEl = previewRef.current
      if (!(previewEl && currentWrapper)) return

      triggerBoundsRef.current = currentWrapper.getBoundingClientRect()
      updatePreviewSize()
      setCurrentPosition(event.clientX, event.clientY)

      isHoveredRef.current = true
      firstCycleRef.current = true

      if (prefersReducedMotionRef.current) {
        gsap.set(previewEl, {
          x: renderedStylesRef.current.tx.current,
          y: renderedStylesRef.current.ty.current,
        })
      }

      showPreview()

      if (!prefersReducedMotionRef.current) {
        scheduleRender()
      }
    }

    function handleMouseLeave() {
      hidePreview()
    }

    function handleTouchStart(event: TouchEvent) {
      if (!preloadedRef.current) {
        const img = new window.Image()
        img.src = src
        preloadedRef.current = true
      }

      event.preventDefault()

      const now = Date.now()

      if (now - lastTapTimeRef.current < 300) {
        const linkEl = wrapperRef.current?.querySelector('a')
        if (linkEl) {
          const href = linkEl.getAttribute('href')
          if (href) {
            window.open(href, '_blank')
          }
        }
        hidePreview()
        lastTapTimeRef.current = 0
        return
      }

      lastTapTimeRef.current = now

      if (isHoveredRef.current) {
        hidePreview()
        return
      }

      const currentWrapper = wrapperRef.current
      const previewEl = previewRef.current
      if (!(previewEl && currentWrapper)) return

      updatePreviewSize()

      const logoRect = currentWrapper.getBoundingClientRect()
      const pw = previewSizeRef.current.width
      const ph = previewSizeRef.current.height

      const x = logoRect.left + logoRect.width / 2 - pw / 2
      let y = logoRect.top - ph - 12

      if (y < 0) {
        y = logoRect.bottom + 12
      }

      // Dismiss any other instance's active preview first
      if (dismissActivePreview) {
        dismissActivePreview()
      }

      isHoveredRef.current = true

      gsap.set(previewEl, { x, y })
      showPreview()

      // Register this instance as the active preview
      dismissActivePreview = hidePreview

      if (documentTapHandler) {
        document.removeEventListener('touchstart', documentTapHandler)
      }

      function handleDocumentTap(e: TouchEvent) {
        if (!wrapperRef.current?.contains(e.target as Node)) {
          hidePreview()
        }
        document.removeEventListener('touchstart', handleDocumentTap)
        documentTapHandler = null
      }

      documentTapHandler = handleDocumentTap
      // Delay registration to next tick so the current touchstart event
      // doesn't immediately fire and consume this one-time handler
      requestAnimationFrame(() => {
        document.addEventListener('touchstart', handleDocumentTap)
      })
    }

    function handleResize() {
      triggerBoundsRef.current = null
      updatePreviewSize()
    }

    if (isTouchRef.current) {
      wrapperEl.addEventListener('touchstart', handleTouchStart)
    } else {
      wrapperEl.addEventListener('mouseenter', handleMouseEnter)
      wrapperEl.addEventListener('mousemove', handleMouseMove)
      wrapperEl.addEventListener('mouseleave', handleMouseLeave)
    }

    window.addEventListener('resize', handleResize)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

    const intersectionObs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (!entry.isIntersecting && isHoveredRef.current) {
          hidePreview()
        }
      },
      { threshold: 0 }
    )
    intersectionObs.observe(wrapperEl)

    return () => {
      stopRenderLoop()

      if (dismissActivePreview === hidePreview) {
        dismissActivePreview = null
      }

      if (isTouchRef.current) {
        wrapperEl.removeEventListener('touchstart', handleTouchStart)
      } else {
        wrapperEl.removeEventListener('mouseenter', handleMouseEnter)
        wrapperEl.removeEventListener('mousemove', handleMouseMove)
        wrapperEl.removeEventListener('mouseleave', handleMouseLeave)
      }

      if (documentTapHandler) {
        document.removeEventListener('touchstart', documentTapHandler)
        documentTapHandler = null
      }

      window.removeEventListener('resize', handleResize)
      reducedMotionQuery.removeEventListener(
        'change',
        handleReducedMotionChange
      )

      intersectionObs.disconnect()

      const previewEl = previewRef.current
      if (previewEl) {
        gsap.killTweensOf(previewEl)
      }
    }
  }, [src])

  return (
    <>
      <span ref={wrapperRef} className={s.root}>
        {children}
      </span>
      {isMounted
        ? createPortal(
            <div ref={previewRef} className={s.preview} aria-hidden="true">
              <Image src={src} alt={alt} fill className={s.previewImage} />
            </div>,
            document.body
          )
        : null}
    </>
  )
}
