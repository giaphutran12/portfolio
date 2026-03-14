'use client'

import cn from 'clsx'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { SplitText } from '@/components/effects/split-text'
import s from './about.module.css'

interface AboutProps {
  aboutText?: string
}

const defaultAboutText =
  "**AI Engineer who ships.** Not \"I watched a tutorial\" ships. Production apps, real users, actual problems solved. Based in Vancouver, BC — studying Computer Science at Douglas College, transferring to SFU. 4x honour roll, 1x Dean's List.\n\nI build across the full stack and the AI stack — from auditing backend auth and enforcing RLS across 15 CRM tables, to training two-tower neural networks in PyTorch and shipping LLM-chaining pipelines. **TypeScript, Python, Next.js, and whatever gets the job done.** I ship 1-2 apps a week at TinyFish, and I've pushed 163+ commits in 7-day sprints at Headstarter.\n\nBeyond code — I founded **Smart Math BC** 7 years ago and still run it. Youth leader at VEYM for 6 years. I write about AI experiments on Medium. I don't just build software, I build things that matter to real people."

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
            I build things that work.
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
