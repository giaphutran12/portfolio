import cn from 'clsx'
import { Link } from '@/components/ui/link'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={cn(s.footer, 'relative z-2')}>
      <div className={s.inner}>
        <span className={s.copyright}>
          © {new Date().getFullYear()} Edward Tran
        </span>
        <nav className={s.links}>
          <Link
            href="https://github.com/giaphutran12"
            className={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <span className={s.separator} aria-hidden="true">
            /
          </span>
          <Link
            href="https://linkedin.com/in/edwardtran"
            className={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
        </nav>
      </div>
    </footer>
  )
}
