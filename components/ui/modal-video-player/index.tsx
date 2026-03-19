'use client'

import cn from 'clsx'
import type { ComponentProps } from 'react'
import s from './modal-video-player.module.css'

interface ModalVideoPlayerProps extends ComponentProps<'div'> {
  src: string
  poster?: string
  title?: string
}

export function ModalVideoPlayer({
  src,
  poster,
  title,
  className,
  ...props
}: ModalVideoPlayerProps) {
  return (
    <div
      className={cn(s.root, className)}
      data-testid="modal-video-player"
      {...props}
    >
      <div className={cn(s.playerContainer)}>
        {/* biome-ignore lint/a11y/useMediaCaption: portfolio demo videos have no captions */}
        <video
          className={cn(s.video)}
          src={src}
          poster={poster}
          controls
          preload="metadata"
          playsInline
          aria-label={title ?? 'Project demo video'}
          data-testid="modal-video-element"
        />
      </div>
      {title ? (
        <p className={cn(s.title)} data-testid="modal-video-title">
          {title}
        </p>
      ) : null}
    </div>
  )
}
