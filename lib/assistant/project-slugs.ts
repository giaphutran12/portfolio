/**
 * Project slugs the page can open a detail dialog for.
 *
 * Must match `getDefaultProjects()` in `lib/integrations/sanity/fetch.ts`
 * (Sanity is not configured in production, so those are the cards on the page).
 * `project-slugs.test.ts` fails if the two drift apart.
 */
export const PROJECT_SLUGS = [
  'x-recommendation-algo',
  'viet-bike-scout',
  'autoresearch-macos',
  'stocktwits-clone-2',
  'self-improving-prompt',
  'lovable-clone',
  'ai-customer-support',
  'serverless-style-transfer',
] as const

export type ProjectSlug = (typeof PROJECT_SLUGS)[number]

export const PAGE_TARGETS = [
  'about',
  'projects',
  'experience',
  'contact',
] as const

export type PageTarget = (typeof PAGE_TARGETS)[number]
