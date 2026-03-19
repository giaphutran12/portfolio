'use client'

import { useEffect, useRef } from 'react'
import { useDocumentVisibility } from '@/hooks/use-sync-external'

type UseVideoAutoplayOptions = {
  /** Margin around the viewport to trigger visibility earlier (default: '200px') */
  rootMargin?: string
  /** Intersection threshold to trigger visibility (default: 0.3) */
  threshold?: number
}

/**
 * Hook that automatically plays/pauses HTML video elements based on viewport visibility
 * and document visibility (tab hidden/visible).
 *
 * Uses IntersectionObserver to detect when video enters/leaves viewport, and pauses
 * when the browser tab is hidden using useDocumentVisibility.
 *
 * @param videoRef - Ref to the HTML video element
 * @param options - Configuration options for IntersectionObserver
 *
 * @example
 * ```tsx
 * function VideoComponent() {
 *   const videoRef = useRef<HTMLVideoElement>(null)
 *   useVideoAutoplay(videoRef)
 *
 *   return <video ref={videoRef} src="video.mp4" />
 * }
 * ```
 */
export function useVideoAutoplay(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { rootMargin = '200px', threshold = 0.3 }: UseVideoAutoplayOptions = {}
): void {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isIntersectingRef = useRef(false)
  const visibility = useDocumentVisibility()

  // Initialize IntersectionObserver
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        isIntersectingRef.current = entry.isIntersecting

        if (entry.isIntersecting) {
          // Play video when it enters viewport
          video.play().catch(() => {
            // Browser may reject autoplay, ignore silently
          })
        } else {
          // Pause video when it leaves viewport
          video.pause()
        }
      },
      { rootMargin, threshold }
    )

    observerRef.current.observe(video)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [videoRef, rootMargin, threshold])

  // Handle document visibility changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (visibility === 'hidden') {
      // Pause when tab is hidden
      video.pause()
    } else if (visibility === 'visible' && isIntersectingRef.current) {
      // Resume playing if tab becomes visible and video is still in viewport
      video.play().catch(() => {
        // Browser may reject autoplay, ignore silently
      })
    }
  }, [visibility, videoRef])
}
