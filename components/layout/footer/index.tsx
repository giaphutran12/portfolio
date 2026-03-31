import cn from 'clsx'
import { Link } from '@/components/ui/link'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.brandBlock}>
          <p className={cn(s.brand, 'label')}>Edward Tran</p>
          <p className={cn(s.statement, 'body-sm')}>
            Building premium web products and practical AI systems.
          </p>
        </div>

        <div className={s.links}>
          <Link href="#projects" className={cn(s.link, 'label')}>
            Projects
          </Link>
          <Link href="#experience" className={cn(s.link, 'label')}>
            Experience
          </Link>
          <Link href="#contact" className={cn(s.link, 'label')}>
            Contact
          </Link>
          <Link
            href="https://github.com/edwardtran"
            className={cn(s.link, 'label')}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </div>

        <p className={cn(s.copyright, 'label')}>
          © {new Date().getFullYear()} Edward Tran
        </p>
      </div>
    </footer>
  )
}
