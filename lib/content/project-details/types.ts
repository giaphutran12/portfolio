export type ProjectDetailId = string

export interface ProjectDetailImage {
  src: string
  alt: string
}

export interface ProjectDetailSection {
  heading: string
  body: string
}

export type ProjectDetailNarrative =
  | {
      body: string
      sections?: readonly ProjectDetailSection[]
    }
  | {
      body?: string
      sections: readonly ProjectDetailSection[]
    }

export interface ProjectDetailLinks {
  github?: string
  live?: string
  demo?: string
}

export interface ProjectDetailCardMedia {
  gradient: string
  imageSrc: string
  hoverImageSrc?: string
  videoSrc?: string
}

export interface ProjectDetail {
  id: ProjectDetailId
  slug: string
  displayTitle: string
  portfolioSummary: string
  highlights: readonly string[]
  techStack: readonly string[]
  primaryVideoUrl?: string
  galleryImages?: readonly ProjectDetailImage[]
  links: ProjectDetailLinks
  narrative?: ProjectDetailNarrative
  cardMedia: ProjectDetailCardMedia
}

export type ProjectDetailsRegistry = Readonly<Record<string, ProjectDetail>>
