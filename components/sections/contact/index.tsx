'use client'

import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { CONTACT_HEADING, defaultSiteConfig } from '@/lib/content/site-content'
import s from './contact.module.css'

interface ContactProps {
  email?: string
  githubUrl?: string
  linkedinUrl?: string
}

export function Contact({
  email = defaultSiteConfig.email,
  githubUrl = defaultSiteConfig.githubUrl,
  linkedinUrl = defaultSiteConfig.linkedinUrl,
}: ContactProps) {
  return (
    <section
      id="contact"
      className={cn(
        s.contact,
        'flex flex-col items-center justify-center gap-12 px-4 dt:py-80 py-16'
      )}
      data-testid="contact-section"
    >
      <h2 className={cn(s.heading, 'heading-lg')}>{CONTACT_HEADING}</h2>

      <div className={cn(s.links, 'flex flex-col items-center gap-6')}>
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

      <p className={cn(s.copyright, 'body-sm')}>© 2026 Edward Tran</p>
    </section>
  )
}
