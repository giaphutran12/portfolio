'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { ProgressText } from '@/components/effects/progress-text'
import s from './about.module.css'

interface AboutProps {
  aboutText?: string
}

const defaultAboutText =
  "**AI engineer who ships production code, not tutorials.** Full stack, AI stack, whatever stack gets the job done. TypeScript, Python, Next.js. Based in Vancouver, studying CS at Douglas College, transferring to SFU.\n\n**I've audited backend auth across 15 CRM tables, trained two-tower neural networks in PyTorch, and shipped LLM pipelines that actually work.** At TinyFish, I push 1-2 apps a week. At Headstarter, I hit 163+ commits in 7-day sprints.\n\n**Founded Smart Math BC 7 years ago and still run it.** Youth leader at VEYM for 6 years. I write about AI experiments on Medium. I don't just build software. I build things that matter."

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*/g, '')
}

export function About({ aboutText = defaultAboutText }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)

  const paragraphs = aboutText.split('\n\n').filter((p) => p.trim())

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(labelRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      gsap.from(dividerRef.current, {
        scaleX: 0,
        duration: 1,
        ease: 'power3.out',
        transformOrigin: 'left',
        scrollTrigger: {
          trigger: dividerRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      gsap.from(headingRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          once: true,
        },
      })
    })

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
        <p ref={labelRef} className={cn(s.label, 'label')}>
          About
        </p>

        <div ref={dividerRef} className={cn(s.divider)} aria-hidden="true" />

        <h2 ref={headingRef} className={cn(s.heading, 'heading-lg')}>
          I build things that work.
        </h2>

        <div className={cn(s.body)}>
          {paragraphs.map((paragraph) => (
            <ProgressText
              key={paragraph}
              className={cn(s.paragraph, 'body-lg')}
              start="bottom bottom"
              end="center center"
            >
              {stripMarkdownBold(paragraph)}
            </ProgressText>
          ))}
        </div>
      </div>
    </section>
  )
}
