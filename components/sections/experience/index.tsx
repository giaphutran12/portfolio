'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import s from './experience.module.css'

interface ExperienceEntry {
  _id?: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string
}

interface ExperienceProps {
  experiences?: ExperienceEntry[]
}

const defaultExperiences: ExperienceEntry[] = [
  {
    _id: 'company-a',
    company: 'Company A',
    role: 'Senior Full-Stack Developer',
    startDate: '2024-01',
    endDate: null,
    current: true,
    description:
      'Building scalable web applications with React, Next.js, and Node.js. Leading architecture decisions and mentoring junior developers across the team.',
  },
  {
    _id: 'company-b',
    company: 'Company B',
    role: 'Full-Stack Developer',
    startDate: '2022-06',
    endDate: '2024-01',
    current: false,
    description:
      'Developed and maintained production features for a high-traffic SaaS platform. Improved core web vitals by 40% through performance optimization work.',
  },
  {
    _id: 'company-c',
    company: 'Company C',
    role: 'Software Engineering Intern',
    startDate: '2021-05',
    endDate: '2022-05',
    current: false,
    description:
      'Contributed to the development of internal tooling and customer-facing features. Shipped multiple projects from design to production.',
  },
]

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function formatDate(dateStr: string): string {
  const [year, monthStr] = dateStr.split('-')
  const month = Number.parseInt(monthStr ?? '1', 10)
  const monthName = MONTH_NAMES[month - 1] ?? 'Jan'
  return `${monthName} ${year ?? ''}`
}

function formatEndDate(endDate: string | null, current: boolean): string {
  if (current) return 'Present'
  if (endDate) return formatDate(endDate)
  return ''
}

function formatDateRange(
  startDate: string,
  endDate: string | null,
  current: boolean
): string {
  const start = formatDate(startDate)
  const end = formatEndDate(endDate, current)
  return `${start} — ${end}`
}

export function Experience({
  experiences = defaultExperiences,
}: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const entryRefs = useRef<Array<HTMLDivElement | null>>([])

  const displayExperiences =
    experiences.length > 0 ? experiences : defaultExperiences

  useEffect(() => {
    gsap.registerPlugin(GSAPSplitText, ScrollTrigger)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    let headingSplit: GSAPSplitText | null = null

    const ctx = gsap.context(() => {
      const heading = headingRef.current

      if (heading) {
        headingSplit = GSAPSplitText.create(heading, {
          type: 'words',
          wordsClass: 'word',
        })

        gsap.set(headingSplit.words, { opacity: 0, y: 24 })
        gsap.to(headingSplit.words, {
          duration: 0.9,
          ease: 'power2.out',
          opacity: 1,
          scrollTrigger: {
            start: 'top 85%',
            toggleActions: 'play none none none',
            trigger: heading,
          },
          stagger: 0.06,
          y: 0,
        })
      }

      const entries = entryRefs.current.filter(
        (el): el is HTMLDivElement => el !== null
      )

      if (entries.length > 0) {
        gsap.set(entries, { opacity: 0, y: 30 })
        gsap.to(entries, {
          duration: 0.8,
          ease: 'power2.out',
          opacity: 1,
          scrollTrigger: {
            start: 'top 85%',
            toggleActions: 'play none none none',
            trigger: timelineRef.current,
          },
          stagger: 0.15,
          y: 0,
        })
      }
    }, sectionRef)

    return () => {
      headingSplit?.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="experience"
      className={cn(s.experience)}
      data-testid="experience-section"
    >
      <div className={cn(s.inner)}>
        <div className={cn(s.headingWrapper)}>
          <h2 ref={headingRef} className={cn(s.heading, 'heading-lg')}>
            Experience
          </h2>
        </div>

        <div ref={timelineRef} className={cn(s.timeline)}>
          {displayExperiences.map((entry, i) => (
            <div
              key={entry._id || entry.company}
              ref={(el) => {
                entryRefs.current[i] = el
              }}
              className={cn(s.entry)}
            >
              <div
                className={cn(s.entryDot)}
                data-current={entry.current ? 'true' : undefined}
              />

              <h3 className={cn(s.company, 'heading-md')}>{entry.company}</h3>
              <p className={cn(s.role, 'body-lg')}>{entry.role}</p>
              <p className={cn(s.date, 'label')}>
                {formatDateRange(entry.startDate, entry.endDate, entry.current)}
              </p>
              <p className={cn(s.description, 'body-sm')}>
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
