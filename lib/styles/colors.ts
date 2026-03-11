const colors = {
  background: '#0a0a08',
  text: '#e8e3d9',
  gold: '#c8a97e',
} as const

const themeNames = ['dark'] as const
const colorNames = ['primary', 'secondary', 'contrast'] as const

const themes = {
  dark: {
    primary: colors.background,
    secondary: colors.text,
    contrast: colors.gold,
  },
} as const satisfies Themes

export { colors, themeNames, themes }

// UTIL TYPES
export type Themes = Record<
  (typeof themeNames)[number],
  Record<(typeof colorNames)[number], string>
>
