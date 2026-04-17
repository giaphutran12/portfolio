'use client'

import cn from 'clsx'
import s from './ai-assistant.module.css'

interface AnimatedDogProps {
  className?: string
  onClick?: () => void
  state?: 'idle' | 'walk'
  direction?: 'left' | 'right'
}

export function AnimatedDog({
  className,
  onClick,
  state = 'idle',
  direction = 'right',
}: AnimatedDogProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(s.animatedDog, className)}
      aria-label="Open AI assistant"
      data-state={state}
      data-direction={direction}
    >
      <span className={s.dogSprite} aria-hidden="true" />
    </button>
  )
}
