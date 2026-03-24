'use client'

import cn from 'clsx'
import { type CSSProperties, useState } from 'react'
import { VideoAutoplay } from '@/components/effects/video-autoplay'
import s from './project-card-video-media.module.css'

interface ProjectCardVideoMediaProps {
  src: string
  poster: string
  className?: string | undefined
}

function toCoverStyle(imageSrc: string): CSSProperties {
  return {
    backgroundImage: `url("${imageSrc}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
}

export function ProjectCardVideoMedia({
  src,
  poster,
  className,
}: ProjectCardVideoMediaProps) {
  const [hasError, setHasError] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const shouldShowFallback = hasError || !isReady

  return (
    <div className={cn(s.root, className)}>
      <div
        className={cn(
          s.fallback,
          shouldShowFallback ? s.isVisible : s.isHidden
        )}
        style={toCoverStyle(poster)}
      />
      <VideoAutoplay
        className={cn(s.video, isReady ? s.isVisible : s.isHidden)}
        onError={() => {
          setHasError(true)
          setIsReady(false)
        }}
        onReady={() => {
          setHasError(false)
          setIsReady(true)
        }}
        poster={poster}
        src={src}
      />
    </div>
  )
}
