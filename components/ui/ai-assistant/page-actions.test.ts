import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import type Lenis from 'lenis'

type ShowOnPage = typeof import('./page-actions').showOnPage
let showOnPage: ShowOnPage

beforeAll(async () => {
  GlobalRegistrator.register()
  ;({ showOnPage } = await import('./page-actions'))
})

afterAll(() => {
  GlobalRegistrator.unregister()
})

function fakeLenis() {
  const scrollTo = mock(() => undefined)
  return { lenis: { scrollTo } as unknown as Lenis, scrollTo }
}

beforeEach(() => {
  document.body.innerHTML = `
    <section id="about"></section>
    <section id="projects">
      <button type="button" data-project-id="viet-bike-scout">Viet Bike Scout</button>
    </section>
    <section id="contact"></section>`
})

describe('showOnPage', () => {
  test('scrolls to a section with the page Lenis instance', async () => {
    const { lenis, scrollTo } = fakeLenis()

    const result = await showOnPage({ target: 'contact', project: null }, lenis)

    expect(result).toEqual({
      shown: true,
      detail: 'Scrolled to the Contact section.',
    })
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect((scrollTo.mock.calls[0] as unknown[])[0]).toBe(
      document.getElementById('contact')
    )
  })

  test('falls back to scrollIntoView without Lenis', async () => {
    const section = document.getElementById('about') as HTMLElement
    const scrollIntoView = mock(() => undefined)
    section.scrollIntoView = scrollIntoView

    const result = await showOnPage(
      { target: 'about', project: null },
      undefined
    )

    expect(result.shown).toBe(true)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  test('opens a project by pressing its card', async () => {
    const { lenis } = fakeLenis()
    const card = document.querySelector<HTMLElement>(
      '[data-project-id="viet-bike-scout"]'
    )
    const onClick = mock(() => undefined)
    card?.addEventListener('click', onClick)

    const result = await showOnPage(
      { target: null, project: 'viet-bike-scout' },
      lenis
    )

    expect(result.shown).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('reports a missing project or section instead of throwing', async () => {
    document.body.innerHTML = ''

    expect(
      await showOnPage({ target: null, project: 'lovable-clone' }, undefined)
    ).toMatchObject({ shown: false })
    expect(
      await showOnPage({ target: 'projects', project: null }, undefined)
    ).toMatchObject({ shown: false })
  })
})
