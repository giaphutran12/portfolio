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
  const copyrightRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { y: 30 })
      gsap.to(headingRef.current, {
        duration: 0.9,
        ease: 'power2.out',
        opacity: 1,
        scrollTrigger: {
          start: 'top 85%',
          toggleActions: 'play none none none',
          trigger: sectionRef.current,
        },
        y: 0,
      })

      if (linksRef.current) {
        const links = linksRef.current.children
        gsap.set(links, { y: 20 })
        gsap.to(links, {
          delay: 0.2,
          duration: 0.7,
          ease: 'power2.out',
          opacity: 1,
          scrollTrigger: {
            start: 'top 85%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.1,
          y: 0,
        })
      }

      gsap.to(copyrightRef.current, {
        delay: 0.5,
        duration: 0.6,
        ease: 'power2.out',
        opacity: 0.6,
        scrollTrigger: {
          start: 'top 85%',
          toggleActions: 'play none none none',
          trigger: sectionRef.current,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={cn(
        s.contact,
        'flex flex-col items-center justify-center gap-12 px-4 dt:py-80 py-16'
      )}
      data-testid="contact-section"
    >
      <h2 ref={headingRef} className={cn(s.heading, 'heading-lg')}>
        Let's Connect
      </h2>

      <div
        ref={linksRef}
        className={cn(s.links, 'flex flex-col items-center gap-6')}
      >
        <Link href={`mailto:${email}`} className={cn(s.link, 'body-lg')}>
          Email
        </Link>
        <Link
          href={githubUrl}
          className={cn(s.link, 'body-lg')}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
        <Link
          href={linkedinUrl}
          className={cn(s.link, 'body-lg')}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </Link>
      </div>

      <p ref={copyrightRef} className={cn(s.copyright, 'body-sm')}>
        © 2026 Edward Tran
      </p>
    </section>
  )
}
