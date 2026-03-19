'use client'

import cn from 'clsx'
import { useRef, useState } from 'react'
import { useVideoAutoplay } from './use-video-autoplay'
import s from './video-autoplay.module.css'

interface VideoAutoplayProps {
  src: string
  poster?: string | undefined
  className?: string | undefined
  suspended?: boolean | undefined
}

export function VideoAutoplay({
  src,
  poster,
  className,
  suspended = false,
}: VideoAutoplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)

  useVideoAutoplay(videoRef, { suspended })

  if (hasError) return null

  return (
    <video
      className={cn(s.video, className)}
      loop
      muted
      onError={() => setHasError(true)}
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
      src={src}
    />
  )
}
