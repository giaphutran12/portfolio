import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
const priorActEnvironment = (
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT
;(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from 'bun:test'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useStore } from '@/lib/hooks/store'
import { Header } from './index'

function renderHeader() {
  const view = render(<Header />)
  const hamburger = view.getByRole('button', { name: /navigation menu/i })
  return { ...view, hamburger }
}

interface ViewportWindow {
  happyDOM: { setViewport: (options: { width: number }) => void }
}

function setViewportWidth(width: number) {
  ;(window as unknown as ViewportWindow).happyDOM.setViewport({ width })
}

function flushDeferredScroll() {
  // handleNavClick defers scrolling behind two rAFs; wait out three to be safe
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })
  })
}

function mountSection(id: string) {
  const section = document.createElement('section')
  section.id = id
  document.body.appendChild(section)
  return section
}

describe('Header mobile nav', () => {
  beforeEach(() => {
    // Header mounts close the menu at desktop widths; default to mobile
    setViewportWidth(500)
    useStore.setState({ isNavOpened: false })
  })

  afterEach(() => {
    cleanup()
    // Reset shared process-global state so nothing leaks into later suites:
    // restore happy-dom's default viewport and the zustand singleton
    setViewportWidth(1024)
    useStore.setState({ isNavOpened: false })
  })

  afterAll(() => {
    const actGlobal = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    if (priorActEnvironment === undefined) {
      delete actGlobal.IS_REACT_ACT_ENVIRONMENT
    } else {
      actGlobal.IS_REACT_ACT_ENVIRONMENT = priorActEnvironment
    }
    GlobalRegistrator.unregister()
  })

  test('hamburger opens the menu through the shared store (scroll-lock wiring)', () => {
    const { hamburger, queryByTestId, getByTestId } = renderHeader()

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(hamburger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(hamburger)

    expect(getByTestId('nav-mobile')).toBeTruthy()
    expect(hamburger.getAttribute('aria-expanded')).toBe('true')
    // Lenis reads this flag to lock body scroll behind the overlay
    expect(useStore.getState().isNavOpened).toBe(true)
  })

  test('hamburger closes an open menu', () => {
    const { hamburger, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    fireEvent.click(hamburger)

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('Escape closes the menu', () => {
    const { hamburger, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('tapping a nav link closes the menu', async () => {
    const section = mountSection('about')
    try {
      const { hamburger, getByTestId, queryByTestId } = renderHeader()

      fireEvent.click(hamburger)
      const aboutLink = getByTestId('nav-mobile').querySelector('button')
      expect(aboutLink).toBeTruthy()

      if (aboutLink) {
        fireEvent.click(aboutLink)
      }

      expect(queryByTestId('nav-mobile')).toBeNull()
      expect(useStore.getState().isNavOpened).toBe(false)
      // settle this test's own deferred scroll so it can't land in a later test
      await flushDeferredScroll()
    } finally {
      section.remove()
    }
  })

  test('backdrop tap closes the menu, taps on links do not reopen it', () => {
    const { hamburger, getByTestId, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    fireEvent.click(getByTestId('nav-mobile'))

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('menu open state renders from the store, not local state', () => {
    useStore.setState({ isNavOpened: true })

    const { getByTestId } = renderHeader()

    expect(getByTestId('nav-mobile')).toBeTruthy()
  })

  test('mounting at desktop width clears a stale-open store (invisible lock guard)', () => {
    setViewportWidth(1200)
    useStore.setState({ isNavOpened: true })

    const { queryByTestId } = renderHeader()

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('unmounting with the menu open releases the scroll-lock flag', () => {
    const { hamburger, unmount } = renderHeader()

    fireEvent.click(hamburger)
    expect(useStore.getState().isNavOpened).toBe(true)

    unmount()

    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('non-Escape keys leave an open menu alone', () => {
    const { hamburger, getByTestId } = renderHeader()

    fireEvent.click(hamburger)
    fireEvent.keyDown(window, { key: 'a' })

    expect(getByTestId('nav-mobile')).toBeTruthy()
    expect(useStore.getState().isNavOpened).toBe(true)
  })

  test('Escape while the menu is closed is a no-op', () => {
    const { queryByTestId } = renderHeader()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('opening moves focus into the menu; closing restores it to the hamburger', () => {
    const { hamburger, getByTestId } = renderHeader()

    fireEvent.click(hamburger)
    const firstLink = getByTestId('nav-mobile').querySelector('button')
    expect(document.activeElement).toBe(firstLink)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.activeElement).toBe(hamburger)
  })

  test('Tab is trapped inside the open menu', () => {
    const { hamburger, getByTestId } = renderHeader()

    fireEvent.click(hamburger)
    const links = Array.from(
      getByTestId('nav-mobile').querySelectorAll('button')
    )
    const lastLink = links[links.length - 1] ?? null
    expect(lastLink).toBeTruthy()

    lastLink?.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    // wrapping past the last link cycles back to the hamburger
    expect(document.activeElement).toBe(hamburger)

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(lastLink)
  })

  test('resizing across the desktop breakpoint closes the menu', () => {
    const { hamburger, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    act(() => {
      setViewportWidth(1200)
    })

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('resizing to exactly the 800px breakpoint closes the menu', () => {
    setViewportWidth(799)
    const { hamburger, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    act(() => {
      setViewportWidth(800)
    })

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('resizing back below the desktop breakpoint keeps the menu open', () => {
    setViewportWidth(1200)
    const { hamburger, getByTestId } = renderHeader()

    fireEvent.click(hamburger)
    act(() => {
      setViewportWidth(500)
    })

    expect(getByTestId('nav-mobile')).toBeTruthy()
    expect(useStore.getState().isNavOpened).toBe(true)
  })

  test('nav link click falls back to native scrollIntoView when lenis is absent', async () => {
    const section = mountSection('about')
    const scrollCalls: ScrollIntoViewOptions[] = []
    section.scrollIntoView = ((options?: boolean | ScrollIntoViewOptions) => {
      if (typeof options === 'object') scrollCalls.push(options)
    }) as typeof section.scrollIntoView

    try {
      const { hamburger, getByTestId } = renderHeader()

      fireEvent.click(hamburger)
      const aboutLink = getByTestId('nav-mobile').querySelector('button')
      expect(aboutLink).toBeTruthy()
      if (aboutLink) {
        fireEvent.click(aboutLink)
      }

      // Scroll must NOT fire synchronously — it waits for the scroll-lock
      // effect to release (double rAF deferral)
      expect(scrollCalls.length).toBe(0)
      await flushDeferredScroll()

      expect(scrollCalls.length).toBe(1)
      expect(scrollCalls[0]?.behavior).toBe('smooth')
    } finally {
      section.remove()
    }
  })

  test('nav link click with no matching section warns without scrolling', () => {
    const { hamburger, getByTestId, queryByTestId } = renderHeader()

    fireEvent.click(hamburger)
    const aboutLink = getByTestId('nav-mobile').querySelector('button')
    expect(aboutLink).toBeTruthy()
    if (aboutLink) {
      // no #about section mounted — the handler must bail before deferring
      fireEvent.click(aboutLink)
    }

    expect(queryByTestId('nav-mobile')).toBeNull()
    expect(useStore.getState().isNavOpened).toBe(false)
  })

  test('hamburger aria-label flips between open and close', () => {
    const { hamburger } = renderHeader()

    expect(hamburger.getAttribute('aria-label')).toBe('Open navigation menu')

    fireEvent.click(hamburger)
    expect(hamburger.getAttribute('aria-label')).toBe('Close navigation menu')

    fireEvent.click(hamburger)
    expect(hamburger.getAttribute('aria-label')).toBe('Open navigation menu')
  })
})
