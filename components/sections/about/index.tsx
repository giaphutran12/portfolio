'use client'

import cn from 'clsx'
import s from './about.module.css'

interface AboutProps {
  aboutText?: string
}

const defaultAboutText =
  "**AI engineer who ships production code, not tutorials.** Full stack, AI stack, whatever stack gets the job done. TypeScript, Python, Next.js. Based in Vancouver, studying CS at Douglas College, transferring to SFU.\n\n**I've audited backend auth across 15 CRM tables, trained two-tower neural networks in PyTorch, and shipped LLM pipelines that actually work.** At TinyFish, I push 1-2 apps a week. At Headstarter, I hit 163+ commits in 7-day sprints.\n\n**Founded Smart Math BC 7 years ago and still run it.** Youth leader at VEYM for 6 years. I write about AI experiments on Medium. I don't just build software. I build things that matter."

export function About({ aboutText = defaultAboutText }: AboutProps) {
  const paragraphs = aboutText.split('\n\n').filter((p) => p.trim())

  return (
    <section id="about" className={cn(s.about)} data-testid="about-section">
      <div className={cn(s.inner)}>
        <p className={cn(s.label, 'label')}>About</p>

        <div className={cn(s.divider)} aria-hidden="true" />

        <h2 className={cn(s.heading, 'heading-lg')}>
          I build things that work.
        </h2>

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
