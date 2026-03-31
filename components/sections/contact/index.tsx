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
    <section id="contact" className={s.contact} data-testid="contact-section">
      <div className={s.inner}>
        <p className={cn(s.kicker, 'label')}>Contact</p>
        <h2 className={cn(s.heading, 'heading-lg')}>Let&apos;s Connect</h2>
        <p className={cn(s.copy, 'body-lg')}>
          If you&apos;re hiring, building, or exploring a high-leverage product,
          I&apos;d love to hear the context and ship something meaningful.
        </p>

        <div className={s.links}>
          <Link href={`mailto:${email}`} className={cn(s.link, 'label')}>
            Email
          </Link>
          <Link
            href={githubUrl}
            className={cn(s.link, 'label')}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link
            href={linkedinUrl}
            className={cn(s.link, 'label')}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
        </div>

        <p className={cn(s.copyright, 'body-sm')}>
          © {new Date().getFullYear()} Edward Tran
        </p>
      </div>
    </section>
  )
}
