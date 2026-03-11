import { Cormorant_Garamond, Syne } from 'next/font/google'
import localFont from 'next/font/local'

const mono = localFont({
  src: [
    {
      path: '../../public/fonts/ServerMono/ServerMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--next-font-mono',
  preload: true,
  adjustFontFallback: 'Arial',
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Consolas',
    'Liberation Mono',
    'Menlo',
    'monospace',
  ],
})

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--next-font-display',
  preload: true,
})

const body = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--next-font-body',
  preload: true,
})

const fonts = [mono, display, body]
const fontsVariable = fonts.map((font) => font.variable).join(' ')

export { fontsVariable }
