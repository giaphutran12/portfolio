import { Link } from '@/components/ui/link'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer}>
      <p className={s.brand}>Edward Tran</p>

      <div className={s.links}>
        <Link href="mailto:edward@edwardtran.ca" className={s.linkPill}>
          Email
        </Link>
        <Link href="https://github.com/edwardtran" className={s.linkPill}>
          GitHub
        </Link>
        <Link href="https://linkedin.com/in/edwardtran" className={s.linkPill}>
          LinkedIn
        </Link>
      </div>
    </footer>
  )
}
