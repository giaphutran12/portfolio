'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from '@/components/ui/link'
import s from './contact.module.css'

interface ContactProps {
  email?: string
  githubUrl?: string
  linkedinUrl?: string
}

export function Contact({
  email = 'edward@edwardtran.ca',
  githubUrl = 'https://github.com/edwardtran',
  linkedinUrl = 'https://linkedin.com/in/edwardtran',
}: ContactProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      })

      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll('a')
        gsap.from(links, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            once: true,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={cn(s.contact)}
      data-testid="contact-section"
    >
      <div className={s.inner}>
        <p className={cn(s.label, 'label')}>Get in touch</p>
        <div className={s.divider} aria-hidden="true" />

        <h2 ref={headingRef} className={cn(s.heading, 'heading-xl')}>
          Let's Connect
        </h2>

        <div ref={linksRef} className={s.links}>
          <Link href={`mailto:${email}`} className={cn(s.link, 'heading-md')}>
            Email
          </Link>
          <span className={s.linkSeparator} aria-hidden="true">
            ·
          </span>
          <Link
            href={githubUrl}
            className={cn(s.link, 'heading-md')}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <span className={s.linkSeparator} aria-hidden="true">
            ·
          </span>
          <Link
            href={linkedinUrl}
            className={cn(s.link, 'heading-md')}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </section>
  )
}
