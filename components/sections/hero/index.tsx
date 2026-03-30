'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { AnimatedGradient } from '@/components/effects/animated-gradient'
import s from './hero.module.css'

const ANIM_DELAY = 0.3
const ANIM_DURATION = 1.5
const ANIM_END = ANIM_DELAY + ANIM_DURATION

interface HeroProps {
  name?: string
  tagline?: string
}

export function Hero({
  name = 'Edward Tran',
  tagline = 'AI Engineer. Ships Code.',
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      if (nameRef.current) {
        nameRef.current.textContent = name
      }
      return
    }

    let rafId = 0
    let nestedRafId = 0

    const ctx = gsap.context(() => {
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 })
      gsap.set(scrollIndicatorRef.current, { opacity: 0 })

      rafId = requestAnimationFrame(() => {
        nestedRafId = requestAnimationFrame(() => {
          // Phase 1: Name scramble text reveal
          gsap.to(nameRef.current, {
            delay: ANIM_DELAY,
            duration: ANIM_DURATION,
            ease: 'power2.out',
            scrambleText: {
              chars: 'アイウエオカキクケコサシスセソタチツテト!@#$%&',
              revealDelay: 0.5,
              speed: 0.4,
              text: name,
            },
          })

          // Phase 2: Tagline slides up + fades in
          gsap.to(subtitleRef.current, {
            delay: ANIM_END,
            duration: 1,
            ease: 'power3.out',
            opacity: 1,
            y: 0,
          })

          // Phase 3: Scroll indicator fades in
          gsap.to(scrollIndicatorRef.current, {
            delay: ANIM_END + 0.5,
            duration: 1,
            ease: 'power2.out',
            opacity: 1,
          })
        })
      })

      // Scroll parallax — content drifts up as user scrolls past hero
      gsap.to(contentRef.current, {
        yPercent: -15,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Scroll indicator fades out on first scroll
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '15% top',
          scrub: true,
        },
      })
    })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (nestedRafId) cancelAnimationFrame(nestedRafId)
      ctx.revert()
    }
  }, [name])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={cn(
        s.hero,
        'relative flex h-dvh flex-col items-center overflow-hidden'
      )}
    >
      <AnimatedGradient
        amplitude={1.5}
        className={cn(s.background)}
        colorAmplitude={2}
        colorFrequency={0.2}
        colors={['#0a0a08', '#241a10', '#3d2e1a', '#0a0a08']}
        frequency={0.25}
        speed={0.5}
      />

      <div
        ref={contentRef}
        className={cn(
          s.content,
          'relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center'
        )}
      >
        <h1 className={cn(s.name, 'heading-xl')} data-testid="hero-name">
          <span className="sr-only">{name}</span>
          <span aria-hidden="true" ref={nameRef}>
            エドワード・トラン
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className={cn(s.subtitle, 'body-lg')}
          data-testid="hero-subtitle"
        >
          {tagline}
        </p>
      </div>

      <div
        ref={scrollIndicatorRef}
        aria-hidden="true"
        className={cn(s.scrollIndicator, 'flex flex-col items-center gap-2')}
      >
        <span className={cn(s.scrollText, 'label')}>Scroll</span>
        <div className={cn(s.scrollLine)} />
      </div>
    </section>
  )
}
