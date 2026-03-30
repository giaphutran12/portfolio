'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

interface ProjectsGridProps {
  children: React.ReactNode
  className?: string | undefined
}

export function ProjectsGrid({ children, className }: ProjectsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion || !gridRef.current) return

    const cards = gridRef.current.querySelectorAll('article')

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 60 })

      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
          })
        },
        start: 'top 88%',
        once: true,
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  )
}
