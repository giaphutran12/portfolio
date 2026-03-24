'use client'

import cn from 'clsx'
import { useRef, useState } from 'react'
import { useVideoAutoplay } from './use-video-autoplay'
import s from './video-autoplay.module.css'

interface VideoAutoplayProps {
  src: string
  poster?: string | undefined
  className?: string | undefined
  onReady?: (() => void) | undefined
  onError?: (() => void) | undefined
}

export function VideoAutoplay({
  src,
  poster,
  className,
  onReady,
  onError,
}: VideoAutoplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const hasReportedReadyRef = useRef(false)

  useVideoAutoplay(videoRef)

  function handleReady() {
    if (hasError || hasReportedReadyRef.current) return

    hasReportedReadyRef.current = true
    onReady?.()
  }

  function handleError() {
    setHasError(true)
    hasReportedReadyRef.current = false
    onError?.()
  }

  if (hasError) return null

  return (
    <video
      className={cn(s.video, className)}
      loop
      muted
      onCanPlay={handleReady}
      onError={handleError}
      onLoadedData={handleReady}
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
      src={src}
    />
  )
}
