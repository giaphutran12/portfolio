'use client'

import cn from 'clsx'
import s from './ai-assistant.module.css'

interface DogProps {
  className?: string
  onClick?: () => void
}

export function Dog({ className, onClick }: DogProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(s.dog, className)}
      aria-label="Open AI assistant"
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={s.dogSvg}
        aria-hidden="true"
      >
        {/* Ears */}
        <g className={s.ears}>
          <path
            d="M18 26 L14 10 L30 18 Z"
            fill="#d4a574"
            stroke="#b0855a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M62 26 L66 10 L50 18 Z"
            fill="#d4a574"
            stroke="#b0855a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* Face */}
        <circle
          cx="40"
          cy="42"
          r="24"
          fill="#e8c8a0"
          stroke="#b0855a"
          strokeWidth="2"
        />

        {/* Cheek fluff */}
        <ellipse cx="22" cy="46" rx="6" ry="8" fill="#e8c8a0" />
        <ellipse cx="58" cy="46" rx="6" ry="8" fill="#e8c8a0" />

        {/* Eyes */}
        <ellipse cx="31" cy="38" rx="4" ry="5" fill="#2d2d2d" />
        <ellipse cx="49" cy="38" rx="4" ry="5" fill="#2d2d2d" />
        <circle cx="32.5" cy="36.5" r="1.5" fill="#ffffff" />
        <circle cx="50.5" cy="36.5" r="1.5" fill="#ffffff" />

        {/* Snout */}
        <ellipse cx="40" cy="48" rx="9" ry="7" fill="#f5dcc0" />
        <ellipse cx="40" cy="45" rx="4" ry="3" fill="#4a3b2a" />
        <path
          d="M40 48 L40 52 M36 51 Q40 54 44 51"
          stroke="#4a3b2a"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tail */}
        <g className={s.tail}>
          <path
            d="M56 58 Q68 54 70 42 Q72 30 64 36"
            stroke="#d4a574"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Paws */}
        <ellipse
          cx="28"
          cy="68"
          rx="5"
          ry="4"
          fill="#e8c8a0"
          stroke="#b0855a"
          strokeWidth="1.5"
        />
        <ellipse
          cx="52"
          cy="68"
          rx="5"
          ry="4"
          fill="#e8c8a0"
          stroke="#b0855a"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  )
}
