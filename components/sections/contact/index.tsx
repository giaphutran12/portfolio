'use client'

import cn from 'clsx'
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
  return (
    <section
      id="contact"
      className={cn(
        s.contact,
        'flex flex-col items-center justify-center px-4 dt:py-80 py-16'
      )}
      data-testid="contact-section"
    >
      <div className={s.panel}>
        <p className={cn(s.eyebrow, 'label')}>Contact</p>
        <h2 className={cn(s.heading, 'heading-lg')}>
          Let&apos;s build something memorable.
        </h2>
        <p className={cn(s.lead, 'body-sm')}>
          Open to product collaborations, startup opportunities, and high-agency
          engineering roles.
        </p>

        <div className={cn(s.links, 'flex flex-col items-center gap-3')}>
          <Link href={`mailto:${email}`} className={cn(s.link, 'body-sm')}>
            {email}
          </Link>
          <div className={s.metaLinks}>
            <Link
              href={githubUrl}
              className={cn(s.metaLink, 'label')}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            <Link
              href={linkedinUrl}
              className={cn(s.metaLink, 'label')}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>

      <p className={cn(s.copyright, 'body-sm')}>© 2026 Edward Tran</p>
    </section>
  )
}
