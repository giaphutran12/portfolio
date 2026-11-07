import { describe, expect, test } from 'bun:test'
import { PROJECT_SLUGS } from '@/lib/assistant/project-slugs'
import { getDefaultProjects } from '@/lib/integrations/sanity/fetch'

describe('PROJECT_SLUGS', () => {
  test('matches the project cards the page renders without Sanity', () => {
    const slugs = getDefaultProjects().map((project) => project.slug.current)

    const expected: string[] = [...PROJECT_SLUGS]

    expect(expected).toEqual(slugs)
  })
})
