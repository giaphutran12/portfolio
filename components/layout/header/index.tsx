'use client'

import cn from 'clsx'
import { useLenis } from 'lenis/react'
import { useEffect, useState } from 'react'
import s from './header.module.css'

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId: string) => {
    if (lenis) {
      lenis.scrollTo(`#${sectionId}`, {
        offset: 0,
        duration: 1.2,
        easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(s.header, isScrolled && s.isScrolled)}
      data-testid="nav-header"
    >
      <div className={s.container}>
        <div className={s.brandCluster}>
          <div className={s.logo}>
            <span className={s.logoText}>ET</span>
          </div>
          <p className={cn(s.status, 'label')}>Open for select projects</p>
        </div>

        <nav className={s.navDesktop}>
          <ul className={s.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={cn(s.navLink, 'label')}
                  type="button"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.actions}>
          <button
            className={cn(s.contactPill, 'label')}
            onClick={() => handleNavClick('contact')}
            type="button"
          >
            Start Conversation
          </button>

          <button
            className={s.hamburger}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            aria-label="Toggle navigation menu"
          >
            <span className={cn(s.hamburgerLine, s.line1)} />
            <span className={cn(s.hamburgerLine, s.line2)} />
            <span className={cn(s.hamburgerLine, s.line3)} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className={s.navMobile}>
          <ul className={s.navListMobile}>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={cn(s.navLinkMobile, 'label')}
                  type="button"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            className={cn(s.contactPillMobile, 'label')}
            onClick={() => handleNavClick('contact')}
            type="button"
          >
            Start Conversation
          </button>
        </nav>
      )}
    </header>
  )
}
