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
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.children
      if (!cards || cards.length === 0) return

      gsap.set(cards, { opacity: 0, y: 40 })
      gsap.to(cards, {
        duration: 0.8,
        ease: 'power2.out',
        opacity: 1,
        scrollTrigger: {
          start: 'top 85%',
          toggleActions: 'play none none none',
          trigger: gridRef.current,
        },
        stagger: 0.15,
        y: 0,
      })
    }, gridRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  )
}
