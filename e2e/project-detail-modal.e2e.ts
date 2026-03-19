import { expect, test } from '@playwright/test'

test.describe('Project detail modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page
      .locator('[data-testid="projects-section"]')
      .scrollIntoViewIfNeeded()
  })

  async function openFirstDetailModal(page: import('@playwright/test').Page) {
    const card = page.locator('[data-has-detail]').first()
    await expect(card).toBeVisible()
    const trigger = card.locator('[data-testid="project-card-trigger"]')
    await trigger.click()
    const popup = page.locator('[data-testid="project-detail-popup"]')
    await expect(popup).toBeVisible()
    return { card, trigger, popup }
  }

  test('clicking a detail-backed card opens the modal with content', async ({
    page,
  }) => {
    const { popup } = await openFirstDetailModal(page)

    const heading = popup.locator('h2, h3').first()
    await expect(heading).toBeVisible()
    await expect(heading).not.toBeEmpty()

    const body = popup.locator('p').first()
    await expect(body).toBeVisible()
    await expect(body).not.toBeEmpty()
  })

  test('pressing Escape closes the modal', async ({ page }) => {
    await openFirstDetailModal(page)

    await page.keyboard.press('Escape')

    await expect(
      page.locator('[data-testid="project-detail-popup"]')
    ).not.toBeVisible()
  })

  test('clicking the X button closes the modal', async ({ page }) => {
    await openFirstDetailModal(page)

    await page.locator('[data-testid="project-detail-close"]').click()

    await expect(
      page.locator('[data-testid="project-detail-popup"]')
    ).not.toBeVisible()
  })

  test('clicking the backdrop closes the modal', async ({ page }) => {
    await openFirstDetailModal(page)

    const backdrop = page.locator('[data-testid="project-detail-backdrop"]')
    await backdrop.click({ position: { x: 5, y: 5 }, force: true })

    await expect(
      page.locator('[data-testid="project-detail-popup"]')
    ).not.toBeVisible()
  })

  test('focus returns to the originating trigger after close', async ({
    page,
  }) => {
    const card = page.locator('[data-has-detail]').first()
    const trigger = card.locator('[data-testid="project-card-trigger"]')

    await trigger.click()
    await expect(
      page.locator('[data-testid="project-detail-popup"]')
    ).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(
      page.locator('[data-testid="project-detail-popup"]')
    ).not.toBeVisible()

    await expect(trigger).toBeFocused()
  })

  test('video-backed modal shows a visible video element', async ({ page }) => {
    const portpalCard = page.locator('[data-project-id="portpal-2"]')
    await portpalCard.scrollIntoViewIfNeeded()
    await expect(portpalCard).toBeVisible()

    const trigger = portpalCard.locator('[data-testid="project-card-trigger"]')
    await trigger.click()

    const popup = page.locator('[data-testid="project-detail-popup"]')
    await expect(popup).toBeVisible()

    const video = popup.locator('[data-testid="modal-video-element"]')
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('src', /\/project-videos\//u)
  })

  test('image-backed modal shows content without video', async ({ page }) => {
    const bpCard = page.locator('[data-project-id="blue-pearl-landing-page"]')
    await bpCard.scrollIntoViewIfNeeded()
    await expect(bpCard).toBeVisible()

    const trigger = bpCard.locator('[data-testid="project-card-trigger"]')
    await trigger.click()

    const popup = page.locator('[data-testid="project-detail-popup"]')
    await expect(popup).toBeVisible()

    await expect(
      popup.locator('[data-testid="modal-video-element"]')
    ).not.toBeVisible()

    const paragraphs = popup.locator('p')
    const count = await paragraphs.count()
    expect(count).toBeGreaterThan(0)
  })
})
