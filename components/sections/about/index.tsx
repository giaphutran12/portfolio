'use client'

import cn from 'clsx'
import { ABOUT_HEADING, defaultSiteConfig } from '@/lib/content/site-content'
import s from './about.module.css'

interface AboutProps {
  aboutText?: string
}

export function About({ aboutText = defaultSiteConfig.aboutText }: AboutProps) {
  const paragraphs = aboutText.split('\n\n').filter((p) => p.trim())

  return (
    <section id="about" className={cn(s.about)} data-testid="about-section">
      <div className={cn(s.inner)}>
        <p className={cn(s.label, 'label')}>About</p>

        <div className={cn(s.divider)} aria-hidden="true" />

        <h2 className={cn(s.heading, 'heading-lg')}>{ABOUT_HEADING}</h2>

        <div className={cn(s.body)}>
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
