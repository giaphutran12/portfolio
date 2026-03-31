import { Link } from '@/components/ui/link'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.brandBlock}>
        <p className={s.brandName}>Edward Tran</p>
        <p className={s.brandLine}>
          Creative engineer building product and AI systems.
        </p>
      </div>

      <div className={s.links}>
        <Link href="mailto:edward@edwardtran.ca" className={s.link}>
          edward@edwardtran.ca
        </Link>
        <Link href="https://github.com/edwardtran" className={s.link}>
          GitHub
        </Link>
        <Link href="https://linkedin.com/in/edwardtran" className={s.link}>
          LinkedIn
        </Link>
      </div>
    </footer>
  )
}
