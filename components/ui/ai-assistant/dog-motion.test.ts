import { describe, expect, test } from 'bun:test'
import { getDogTargetPosition } from './dog-motion'

// Regression: ISSUE-DOG-MOTION - dog drifted upward while following cursor
// Found by /qa on 2026-04-17
// Report: .gstack/qa-reports/qa-report-localhost-2026-04-17.md
describe('getDogTargetPosition', () => {
  test('follows cursor in 2D while keeping radial distance', () => {
    const target = getDogTargetPosition({
      dogSize: 104,
      dogX: 960,
      dogY: 620,
      followDistance: 220,
      frozen: false,
      heroVisible: false,
      margin: 16,
      mouseX: 1012,
      mouseY: 300,
      viewportHeight: 800,
      viewportWidth: 1280,
    })

    expect(target.x).toBe(960)
    expect(target.y).toBe(468)
  })

  test('anchors dog bottom-right while hero is visible', () => {
    expect(
      getDogTargetPosition({
        dogSize: 104,
        dogX: 300,
        dogY: 220,
        followDistance: 220,
        frozen: false,
        heroVisible: true,
        margin: 16,
        mouseX: 120,
        mouseY: 120,
        viewportHeight: 800,
        viewportWidth: 1280,
      })
    ).toEqual({
      x: 1160,
      y: 680,
    })
  })

  test('keeps frozen dog on current lane position', () => {
    expect(
      getDogTargetPosition({
        dogSize: 104,
        dogX: 420,
        dogY: 520,
        followDistance: 220,
        frozen: true,
        heroVisible: false,
        margin: 16,
        mouseX: 900,
        mouseY: 240,
        viewportHeight: 800,
        viewportWidth: 1280,
      })
    ).toEqual({
      x: 420,
      y: 520,
    })
  })
})
