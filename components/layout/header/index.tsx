'use client'

import cn from 'clsx'
import { useLenis } from 'lenis/react'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/hooks/store'
import { breakpoints } from '@/styles/config'
import s from './header.module.css'

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const isNavOpened = useStore((state) => state.isNavOpened)
  const setIsNavOpened = useStore((state) => state.setIsNavOpened)
  const lenis = useLenis()
  const navRef = useRef<HTMLElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const wasOpenedRef = useRef(false)
  const scrollRafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // If this header ever unmounts with the menu open (route change, HMR), the
  // store outlives it and would leave the Lenis scroll-lock stuck on.
  useEffect(
    () => () => {
      setIsNavOpened(false)
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current)
      }
    },
    [setIsNavOpened]
  )

  useEffect(() => {
    if (!isNavOpened) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!event.defaultPrevented) {
          setIsNavOpened(false)
        }
        return
      }

      if (event.key === 'Tab') {
        const hamburger = hamburgerRef.current
        const nav = navRef.current
        if (!(hamburger && nav)) return

        const focusables: HTMLElement[] = [
          hamburger,
          ...Array.from(nav.querySelectorAll<HTMLElement>('button')),
        ]
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (!(first && last)) return

        const active =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null

        if (!(active && focusables.includes(active))) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isNavOpened, setIsNavOpened])

  // The overlay is a modal surface: move focus in on open, restore on close
  useEffect(() => {
    if (isNavOpened) {
      wasOpenedRef.current = true
      navRef.current?.querySelector('button')?.focus()
    } else if (wasOpenedRef.current) {
      wasOpenedRef.current = false
      hamburgerRef.current?.focus()
    }
  }, [isNavOpened])

  useEffect(() => {
    const desktopQuery = window.matchMedia(`(min-width: ${breakpoints.dt}px)`)

    // CSS hides the overlay at desktop widths; without this mount-time check a
    // stale-open store would leave an invisible scroll-lock on the page
    if (desktopQuery.matches) {
      setIsNavOpened(false)
    }

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsNavOpened(false)
      }
    }

    desktopQuery.addEventListener('change', handleChange)
    return () => desktopQuery.removeEventListener('change', handleChange)
  }, [setIsNavOpened])

  const handleNavClick = (sectionId: string) => {
    setIsNavOpened(false)

    const target = document.getElementById(sectionId)
    if (!target) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[header] nav target "#${sectionId}" not found`)
      }
      return
    }

    const scrollToSection = () => {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.2,
          easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
          force: true,
        })
      } else {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // The nav scroll-lock (html.overflow-hidden) is removed in an effect after
    // this click commits; scrolling before that leaves the page pinned at top.
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current)
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null
        scrollToSection()
      })
    })
  }

  return (
    <header
      className={cn(
        s.header,
        isScrolled && s.isScrolled,
        isNavOpened && s.isNavOpen
      )}
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
          ref={hamburgerRef}
          className={cn(s.hamburger, isNavOpened && s.isOpen)}
          onClick={() => setIsNavOpened(!isNavOpened)}
          type="button"
          aria-label={
            isNavOpened ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={isNavOpened}
          aria-controls="mobile-nav"
        >
          <span className={cn(s.hamburgerLine, s.line1)} />
          <span className={cn(s.hamburgerLine, s.line2)} />
          <span className={cn(s.hamburgerLine, s.line3)} />
        </button>
      </div>

      {isNavOpened && (
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop tap-to-close; keyboard users close via Escape
        // biome-ignore lint/a11y/useKeyWithClickEvents: the Escape handler is the keyboard equivalent of the backdrop tap
        <nav
          ref={navRef}
          id="mobile-nav"
          className={s.navMobile}
          data-testid="nav-mobile"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsNavOpened(false)
            }
          }}
        >
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
