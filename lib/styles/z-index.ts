/**
 * Z-Index Layer Contract
 *
 * Defines a consistent stacking order across the application.
 * All z-index values should use these custom properties to avoid collisions.
 */

export const zIndex = {
  canvas: 0,
  noiseWaves: 5,
  content: 20,
  header: 50,
  overlay: 100,
  tooltip: 200,
  preview: 300,
} as const
