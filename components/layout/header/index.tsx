'use client'

import cn from 'clsx'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'
import { useEffect, useRef, useState } from 'react'
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
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!prefersReducedMotion && headerRef.current) {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -20,
        duration: 1,
        delay: 2.2,
        ease: 'power3.out',
      })
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
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
      ref={headerRef}
      className={cn(s.header, isScrolled && s.isScrolled)}
      data-testid="nav-header"
    >
      <div className={s.container}>
        <div className={s.logo}>
          <span className={s.logoText}>ET</span>
        </div>

        <nav className={s.navDesktop}>
          <ul className={s.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={s.navLink}
                  type="button"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

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

      {isMobileMenuOpen && (
        <nav className={s.navMobile}>
          <ul className={s.navListMobile}>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={s.navLinkMobile}
                  type="button"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
