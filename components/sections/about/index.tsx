'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { SplitText } from '@/components/effects/split-text'
import s from './about.module.css'

interface AboutProps {
  aboutText?: string
}

const defaultAboutText =
  "I'm a full-stack developer based in Houston, TX, with a passion for building products that live at the intersection of design and engineering. I believe the best digital experiences are those that feel inevitable — where every interaction is considered, every pixel earns its place.\n\nMy work spans the full stack: from architecting scalable backend systems to obsessing over the micro-animations that make an interface feel alive. I care deeply about performance, accessibility, and the craft of writing code that is as maintainable as it is expressive.\n\nWhen I'm not shipping products, I'm exploring the edges of what the web can do — experimenting with WebGL, generative art, and the rare moments when technology becomes poetry."

export function About({ aboutText = defaultAboutText }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<{
    getSplitText: () => import('gsap/SplitText').SplitText | null
    getNode: () => HTMLElement | null
    splittedText: import('gsap/SplitText').SplitText | null
  } | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const paragraphs = aboutText.split('\n\n').filter((p) => p.trim())

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const splitInstance = headingRef.current?.getSplitText()
      const words = splitInstance?.words

      if (words && words.length > 0) {
        gsap.fromTo(
          words,
          { y: '110%' },
          {
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              start: 'top 80%',
              toggleActions: 'play none none none',
              trigger: sectionRef.current,
            },
            stagger: 0.08,
            y: '0%',
          }
        )
      }

      if (bodyRef.current) {
        gsap.from(bodyRef.current.children, {
          delay: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          opacity: 0,
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.15,
          y: 16,
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className={cn(s.about)}
      data-testid="about-section"
    >
      <div className={cn(s.inner)}>
        <p className={cn(s.label, 'label')}>About</p>

        <div className={cn(s.divider)} aria-hidden="true" />

        <h2 className={cn(s.heading, 'heading-lg')}>
          <SplitText ref={headingRef} as="span" type="words" mask>
            Crafting digital experiences with intention.
          </SplitText>
        </h2>

        <div ref={bodyRef} className={cn(s.body)}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={cn(s.paragraph, 'body-lg')}>
              {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <span key={part} className={cn(s.accent)}>
                      {part.slice(2, -2)}
                    </span>
                  )
                }
                return part
              })}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
