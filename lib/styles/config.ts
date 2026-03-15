import { colors, themeNames, themes } from './colors'
import { easings } from './easings'
import { breakpoints, customSizes, layout, screens } from './layout.mjs'
import { fonts, typography } from './typography'
import { zIndex } from './z-index'

const config = {
  colors,
  fonts,
  themeNames,
  themes,
  easings,
  breakpoints,
  customSizes,
  layout,
  screens,
  typography,
  zIndex,
} as const

export {
  breakpoints,
  colors,
  customSizes,
  easings,
  fonts,
  layout,
  screens,
  themeNames,
  themes,
  typography,
  zIndex,
}
export type ThemeName = keyof typeof themes
export type Config = typeof config
