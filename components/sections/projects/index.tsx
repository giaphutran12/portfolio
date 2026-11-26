'use client'

import cn from 'clsx'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { ProjectCardMedia } from '@/components/effects/project-card-media'
import type { Project as SanityProject } from '@/integrations/sanity/fetch'
import { defaultProjects } from '@/lib/content/site-content'
import { ProjectCardVideoMedia } from './project-card-video-media'
import {
  type ProjectCard,
  ProjectDetailContent,
} from './project-detail-content'
import s from './projects.module.css'
import { ProjectsGrid } from './projects-grid'
import { ProjectsHeading } from './projects-heading'

interface ProjectsProps {
  projects?: SanityProject[]
}

interface ProjectMedia {
  gradient: string
  imageSrc: string
  hoverImageSrc?: string
  videoSrc?: string
}

const PROJECT_CARD_HOVER_LIFT_PX = 6
const COVER_TITLE_COLOR = '#f1e9da'
const COVER_CAPTION_COLOR = '#c8a97e'
const COVER_WIDTH = 1600
const COVER_TITLE_MAX_FONT_SIZE = 200
const COVER_TITLE_MAX_WIDTH = 1300
const SERIF_AVERAGE_GLYPH_WIDTH_EM = 0.52

function toGradientDataUrl(colorA: string, colorB: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeSvgText(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/**
 * A cover for a project that has no screen recording: its name and one line of
 * proof on a gradient. System fonts only, because an SVG used as an image
 * cannot load web fonts.
 */
function toWordmarkDataUrl(
  colorA: string,
  colorB: string,
  title: string,
  caption: string
) {
  const titleFontSize = Math.min(
    COVER_TITLE_MAX_FONT_SIZE,
    Math.floor(
      COVER_TITLE_MAX_WIDTH / (title.length * SERIF_AVERAGE_GLYPH_WIDTH_EM)
    )
  )
  const centerX = COVER_WIDTH / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="900" viewBox="0 0 ${COVER_WIDTH} 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="${COVER_WIDTH}" height="900" fill="url(#g)"/><text x="${centerX}" y="470" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" fill="${COVER_TITLE_COLOR}">${escapeSvgText(title)}</text><text x="${centerX}" y="565" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="36" letter-spacing="7" fill="${COVER_CAPTION_COLOR}">${escapeSvgText(caption.toUpperCase())}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function toCoverStyle(imageSrc: string): CSSProperties {
  return {
    backgroundImage: `url("${imageSrc}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
}

const projectCardLiftStyle = {
  '--project-card-hover-lift-px': `${PROJECT_CARD_HOVER_LIFT_PX}px`,
} as CSSProperties

/** Pictures and video for each project, by project id. The words live in lib/content/site-content.ts. */
const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  tower: {
    gradient:
      'linear-gradient(135deg, rgb(200 169 126 / 0.1) 0%, rgb(10 10 8 / 0.25) 100%)',
    imageSrc: toWordmarkDataUrl(
      '#3d2e20',
      '#120d08',
      'Tower',
      '2,500+ of 3,100+ merged pull requests'
    ),
  },
  bigset: {
    gradient:
      'linear-gradient(135deg, rgb(19 78 74 / 0.2) 0%, rgb(10 10 8 / 0.25) 100%)',
    imageSrc: toWordmarkDataUrl(
      '#123c3a',
      '#07171a',
      'BigSet',
      'One sentence in, a live dataset out'
    ),
  },
  'viet-bike-scout': {
    gradient:
      'linear-gradient(135deg, rgb(6 78 59 / 0.4) 0%, rgb(19 78 74 / 0.35) 100%)',
    imageSrc: '/project-pic/viet-bike-scout/viet-bike-scout1.avif',
    videoSrc: '/project-videos/viet-bike-scout.mp4',
  },
  'x-recommendation-algo': {
    gradient:
      'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(124 45 18 / 0.35) 100%)',
    imageSrc: '/project-pic/x-rec/x-rec1.avif',
    hoverImageSrc: '/project-pic/x-rec/X-REC2.avif',
    videoSrc: '/project-videos/x-recommendation-algo.mp4',
  },
  'predict-trump': {
    gradient:
      'linear-gradient(135deg, rgb(136 19 55 / 0.2) 0%, rgb(10 10 8 / 0.25) 100%)',
    imageSrc: toWordmarkDataUrl(
      '#4a1f1f',
      '#150a0a',
      'Predict Trump',
      'My fine-tune lost. I published it.'
    ),
  },
  'brand-guide-generator': {
    gradient:
      'linear-gradient(135deg, rgb(76 29 149 / 0.2) 0%, rgb(10 10 8 / 0.25) 100%)',
    imageSrc: toWordmarkDataUrl(
      '#2b2452',
      '#0d0b1d',
      'Brand Guide Generator',
      'URL in, brand guide out'
    ),
  },
  'stocktwits-clone-2': {
    gradient:
      'linear-gradient(135deg, rgb(88 28 135 / 0.4) 0%, rgb(131 24 67 / 0.35) 100%)',
    imageSrc: '/project-pic/stolk/stolk1.avif',
    hoverImageSrc: '/project-pic/stolk/stolk2.avif',
    videoSrc: '/project-videos/stocktwits-clone.mp4',
  },
  'self-improving-prompt': {
    gradient:
      'linear-gradient(135deg, rgb(6 95 70 / 0.4) 0%, rgb(17 94 89 / 0.35) 100%)',
    imageSrc: '/project-pic/self-improving-prompt/sip1.avif',
    hoverImageSrc: '/project-pic/self-improving-prompt/sip2.avif',
    videoSrc: '/project-videos/self-improving-prompt.mp4',
  },
  'ai-customer-support': {
    gradient:
      'linear-gradient(135deg, rgb(190 18 60 / 0.4) 0%, rgb(136 19 55 / 0.35) 100%)',
    imageSrc: '/project-pic/aven-customer-support/aven-pic.png',
    videoSrc: '/project-videos/ai-customer-support.mp4',
  },
  'lovable-clone': {
    gradient:
      'linear-gradient(135deg, rgb(109 40 217 / 0.4) 0%, rgb(76 29 149 / 0.35) 100%)',
    imageSrc: toGradientDataUrl('#6d28d9', '#4c1d95'),
    videoSrc: '/project-videos/lovable-clone.mp4',
  },
}

const DEFAULT_PROJECT_MEDIA: ProjectMedia = {
  gradient:
    'linear-gradient(135deg, rgb(30 58 138 / 0.4) 0%, rgb(49 46 129 / 0.35) 100%)',
  imageSrc: toGradientDataUrl('#1e3a8a', '#312e81'),
}

function toProjectCard(project: SanityProject): ProjectCard {
  const media = PROJECT_MEDIA[project._id] ?? DEFAULT_PROJECT_MEDIA

  return {
    id: project._id,
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    gradient: media.gradient,
    imageSrc: project.image?.asset?.url || media.imageSrc,
    hoverImageSrc: media.hoverImageSrc,
    videoSrc: media.videoSrc,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
  }
}

function mapProjects(projects?: SanityProject[]): ProjectCard[] {
  const source = projects && projects.length > 0 ? projects : defaultProjects
  return source.map(toProjectCard)
}

export function Projects({ projects }: ProjectsProps) {
  const projectCards = mapProjects(projects)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )

  const selectedProject =
    projectCards.find((p) => p.id === selectedProjectId) || null

  const handleCardClick = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  return (
    <section id="projects" className={s.section} data-testid="projects-section">
      <div className="dr-layout-block">
        <ProjectsHeading />
        <ProjectsGrid className={s.grid}>
          {projectCards.map((project) => (
            <button
              key={project.id}
              type="button"
              className={s.card}
              data-project-id={project.id}
              style={projectCardLiftStyle}
              onClick={() => handleCardClick(project.id)}
              aria-label={`Open details for ${project.title}`}
            >
              <div aria-hidden="true" className={s.imageArea}>
                {project.videoSrc ? (
                  <ProjectCardVideoMedia
                    className={s.imageEffect}
                    poster={project.imageSrc}
                    src={project.videoSrc}
                  />
                ) : (
                  <ProjectCardMedia
                    className={s.imageEffect}
                    style={toCoverStyle(project.imageSrc)}
                    imageSrc={project.imageSrc}
                    {...(project.hoverImageSrc
                      ? { hoverImageSrc: project.hoverImageSrc }
                      : {})}
                  />
                )}
                <div
                  className={s.gradientLayer}
                  style={{ backgroundImage: project.gradient }}
                />
              </div>
              <div className={s.content}>
                <h3 className={cn(s.cardTitle, 'heading-md')}>
                  {project.title}
                </h3>
                <p className={cn(s.description, 'body-sm')}>
                  {project.description}
                </p>
                <ul aria-label="Tech stack" className={s.tags}>
                  {project.techStack.map((tech) => (
                    <li key={tech} className={cn(s.tag, 'label')}>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </ProjectsGrid>
      </div>

      {selectedProject && (
        <ProjectDetailContent
          project={selectedProject}
          open={Boolean(selectedProject)}
          onOpenChange={(open) => {
            if (!open) setSelectedProjectId(null)
          }}
        />
      )}
    </section>
  )
}
