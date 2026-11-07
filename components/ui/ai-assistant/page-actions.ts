import type Lenis from 'lenis'
import type {
  ShowOnPageInput,
  ShowOnPageOutput,
} from '@/lib/assistant/tools/show-on-page'

const SECTION_LABELS = {
  about: 'About',
  projects: 'Projects',
  experience: 'Experience',
  contact: 'Contact',
} as const

const SCROLL_DURATION_S = 1.2
/** Wait for the dialog's open animation start before reporting back. */
const DIALOG_SETTLE_MS = 350

function scrollToElement(target: HTMLElement, lenis: Lenis | undefined) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: 0,
      duration: SCROLL_DURATION_S,
      easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      force: true,
    })
    return
  }
  target.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Runs the show_on_page tool in the browser: scrolls to a section, or scrolls
 * to the projects grid and presses the card, which opens its detail dialog.
 * Uses the page's Lenis instance when there is one. Always resolves with a
 * result the model can read, never throws.
 */
export async function showOnPage(
  input: ShowOnPageInput,
  lenis: Lenis | undefined
): Promise<ShowOnPageOutput> {
  if (input.project) {
    const card = document.querySelector<HTMLElement>(
      `[data-project-id="${CSS.escape(input.project)}"]`
    )
    if (!card) {
      return { shown: false, detail: 'That project is not on the page.' }
    }
    const section = document.getElementById('projects')
    if (section) scrollToElement(section, lenis)
    await new Promise((resolve) => setTimeout(resolve, DIALOG_SETTLE_MS))
    card.click()
    return { shown: true, detail: 'Opened the project details.' }
  }

  if (input.target) {
    const section = document.getElementById(input.target)
    if (!section) {
      return { shown: false, detail: 'That section is not on the page.' }
    }
    scrollToElement(section, lenis)
    return {
      shown: true,
      detail: `Scrolled to the ${SECTION_LABELS[input.target]} section.`,
    }
  }

  return { shown: false, detail: 'Nothing to show was given.' }
}
