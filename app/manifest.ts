import type { MetadataRoute } from 'next'
import { defaultSiteConfig, SITE_DESCRIPTION } from '@/lib/content/site-content'
import { themes } from '@/styles/colors'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: defaultSiteConfig.name,
    short_name: defaultSiteConfig.name,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: themes.dark.primary,
    theme_color: themes.dark.primary,
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
