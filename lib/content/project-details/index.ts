import { bluePearlLandingPage } from './blue-pearl-landing-page'
import { portpal2 } from './portpal-2'
import type { ProjectDetail, ProjectDetailsRegistry } from './types'

export type {
  ProjectDetail,
  ProjectDetailCardMedia,
  ProjectDetailId,
  ProjectDetailImage,
  ProjectDetailLinks,
  ProjectDetailNarrative,
  ProjectDetailSection,
  ProjectDetailsRegistry,
} from './types'

export function defineProjectDetail(detail: ProjectDetail): ProjectDetail {
  return detail
}

export const projectDetailsRegistry = {
  [bluePearlLandingPage.id]: defineProjectDetail(bluePearlLandingPage),
  [portpal2.id]: defineProjectDetail(portpal2),
} as const satisfies ProjectDetailsRegistry

export const projectDetails = Object.freeze(
  Object.values(projectDetailsRegistry)
) as readonly ProjectDetail[]

export function getProjectDetailBySlug(
  slug: string
): ProjectDetail | undefined {
  return projectDetails.find((detail) => detail.slug === slug)
}
