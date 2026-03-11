import cn from 'clsx'
import { Link } from '@/components/ui/link'
import s from './contact.module.css'

export function Contact() {
  return (
    <section
      id="contact"
      className={cn(
        s.contact,
        'flex flex-col items-center justify-center gap-12 px-4 py-80'
      )}
      data-testid="contact-section"
    >
      <h2 className={cn(s.heading, 'heading-lg')}>Let's Connect</h2>

      <div className={cn(s.links, 'flex flex-col items-center gap-6')}>
        <Link
          href="mailto:edward@edwardtran.ca"
          className={cn(s.link, 'body-lg')}
        >
          Email
        </Link>
        <Link
          href="https://github.com/edwardtran"
          className={cn(s.link, 'body-lg')}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
        <Link
          href="https://linkedin.com/in/edwardtran"
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
