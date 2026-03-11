'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import s from './projects.module.css'

export function ProjectsHeading() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    gsap.registerPlugin(GSAPSplitText, ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const split = GSAPSplitText.create(headingRef.current, {
        autoSplit: true,
        mask: 'words',
        type: 'words',
        wordsClass: 'word',
      })

      gsap.fromTo(
        split.words,
        { y: '110%' },
        {
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            start: 'top 88%',
            trigger: headingRef.current,
          },
          stagger: 0.08,
          y: '0%',
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <h2 ref={headingRef} className={cn(s.heading, 'heading-lg')}>
      Projects
    </h2>
  )
}
