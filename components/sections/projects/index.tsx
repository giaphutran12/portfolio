'use client'

import cn from 'clsx'
import { useRef, useState } from 'react'
import { ProjectCardMedia } from '@/components/effects/project-card-media'
import { VideoAutoplay } from '@/components/effects/video-autoplay'
import { Link } from '@/components/ui/link'
import { ModalImageCarousel } from '@/components/ui/modal-image-carousel'
import { ModalVideoPlayer } from '@/components/ui/modal-video-player'
import { ProjectDetailDialog } from '@/components/ui/project-detail-dialog'
import type { Project as SanityProject } from '@/integrations/sanity/fetch'
import {
  getProjectDetailById,
  hasProjectDetail,
} from '@/lib/content/project-details'
import { useProjectDetailDialogOpen } from '@/lib/hooks/use-project-detail-dialog-open'
import s from './projects.module.css'
import { ProjectsGrid } from './projects-grid'
import { ProjectsHeading } from './projects-heading'

interface ProjectCard {
  id: string
  title: string
  description: string
  techStack: string[]
  gradient: string
  imageSrc: string
  hoverImageSrc?: string
  videoSrc?: string
}

interface ProjectsProps {
  projects?: SanityProject[]
}

function toGradientDataUrl(colorA: string, colorB: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function toWebpFallback(src: string): string | undefined {
  if (!(src.startsWith('/') && src.endsWith('.avif'))) {
    return undefined
  }

  return src.replace(/\.avif$/u, '.webp')
}

function toPreferredMediaSource(src: string): string {
  return toWebpFallback(src) ?? src
}

function toBackgroundImage(src: string): string {
  const webpFallback = toWebpFallback(src)

  if (!webpFallback) {
    return `url("${src}")`
  }

  return `image-set(url("${src}") type("image/avif"), url("${webpFallback}") type("image/webp"))`
}

const fallbackProjects: ProjectCard[] = [
  {
    id: 'x-recommendation-algo',
    title: 'X Recommendation Algorithm',
    description:
      "Reverse-engineered X's recommendation engine to expose algorithmic bias and engagement patterns. Built a ML pipeline that decoded what makes content viral, then proved it.",
    gradient:
      'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(124 45 18 / 0.35) 100%)',
    techStack: ['Next.js', 'PyTorch', 'ONNX', 'Supabase'],
    imageSrc: toGradientDataUrl('#78350f', '#7c2d12'),
    videoSrc: '/project-videos/x-recommendation-algo.mp4',
  },
  {
    id: 'viet-bike-scout',
    title: 'Viet Bike Scout',
    description:
      'Real-time motorcycle marketplace aggregator for Vietnam. Scrapes 5+ platforms, normalizes chaos into clean data, and surfaces price trends before the market moves.',
    gradient:
      'linear-gradient(135deg, rgb(6 78 59 / 0.4) 0%, rgb(19 78 74 / 0.35) 100%)',
    techStack: ['Next.js', 'Supabase', 'Zod'],
    imageSrc: toGradientDataUrl('#065f46', '#115e59'),
    videoSrc: '/project-videos/viet-bike-scout.mp4',
  },
  {
    id: 'autoresearch-macos',
    title: 'AutoResearch macOS',
    description:
      'AI research assistant that actually works. Point it at a topic, it browses, reads, synthesizes. Turns 10 hours of research into structured reports in minutes.',
    gradient:
      'linear-gradient(135deg, rgb(30 58 138 / 0.4) 0%, rgb(49 46 129 / 0.35) 100%)',
    techStack: ['Swift', 'macOS', 'LLM'],
    imageSrc: toGradientDataUrl('#1e3a8a', '#312e81'),
    videoSrc: '/project-videos/autoresearch-macos.mp4',
  },
  {
    id: 'stocktwits-clone-2',
    title: 'StockTwits Clone',
    description:
      'Real-time social trading platform. Live market data, sentiment analysis, WebSocket-powered feeds. Built for traders who want to see what the crowd is thinking before they trade.',
    gradient:
      'linear-gradient(135deg, rgb(88 28 135 / 0.4) 0%, rgb(131 24 67 / 0.35) 100%)',
    techStack: ['Next.js', 'Prisma', 'Clerk', 'Claude'],
    imageSrc: toGradientDataUrl('#581c87', '#831843'),
    videoSrc: '/project-videos/stocktwits-clone.mp4',
  },
  {
    id: 'self-improving-prompt',
    title: 'Self-Improving Prompt Engine',
    description:
      'CI/CD for prompts. Evaluate, fail, improve, repeat. Averaged +42% score lift across 10K+ prompts using multi-agent feedback loops. Prompts that get better on their own.',
    gradient:
      'linear-gradient(135deg, rgb(6 95 70 / 0.4) 0%, rgb(17 94 89 / 0.35) 100%)',
    techStack: ['Next.js', 'FastAPI', 'Gemini', 'Redis'],
    imageSrc: '/project-pic/self-improving-prompt/sip1.avif',
    hoverImageSrc: '/project-pic/self-improving-prompt/sip2.avif',
  },
  {
    id: 'lovable-clone',
    title: 'Lovable Clone',
    description:
      'Full-stack AI code generator. Sandboxed preview, auth, payments, background jobs, type safety, Postgres. Everything wired. Everything works.',
    gradient:
      'linear-gradient(135deg, rgb(109 40 217 / 0.4) 0%, rgb(76 29 149 / 0.35) 100%)',
    techStack: ['Next.js', 'Prisma', 'E2B', 'Inngest'],
    imageSrc: toGradientDataUrl('#6d28d9', '#4c1d95'),
    videoSrc: '/project-videos/lovable-clone.mp4',
  },
  {
    id: 'ai-customer-support',
    title: 'AI Customer Support Agent',
    description:
      'Context-aware support agent for fintech. Scrapes docs with Firecrawl, searches with Pinecone, handles calls with VAPI. Reduced support overhead by 80%.',
    gradient:
      'linear-gradient(135deg, rgb(190 18 60 / 0.4) 0%, rgb(136 19 55 / 0.35) 100%)',
    techStack: ['Firecrawl', 'Pinecone', 'VAPI'],
    imageSrc: toGradientDataUrl('#be123c', '#881337'),
    videoSrc: '/project-videos/ai-customer-support.mp4',
  },
  {
    id: 'serverless-style-transfer',
    title: 'Serverless Image Style Transfer',
    description:
      'Transform image styles in the browser using Rust and WASM. Zero backend. 95% cost reduction. Runs entirely on the client.',
    gradient:
      'linear-gradient(135deg, rgb(217 119 6 / 0.4) 0%, rgb(180 83 9 / 0.35) 100%)',
    techStack: ['Rust', 'WebAssembly', 'ONNX'],
    imageSrc: '/project-pic/web-assembly-image-style-transfer/ist1.avif',
    hoverImageSrc: '/project-pic/web-assembly-image-style-transfer/ist2.avif',
  },
  {
    id: 'intelligent-llm-router',
    title: 'Intelligent LLM Router',
    description:
      'Smart traffic controller for AI requests. Analyzes intent, routes to optimal model — coding to Claude, simple chat to free models, complex reasoning to GPT. ~100ms routing overhead.',
    gradient:
      'linear-gradient(135deg, rgb(14 116 144 / 0.4) 0%, rgb(8 145 178 / 0.35) 100%)',
    techStack: ['Next.js', 'TypeScript', 'OpenRouter', 'Gemini'],
    imageSrc: toGradientDataUrl('#0e7490', '#0891b2'),
    videoSrc: '/project-videos/intelligent-llm-router.mp4',
  },
  {
    id: 'blue-pearl-landing-page',
    title: 'Blue Pearl Mortgages & Investments',
    description:
      'Full-stack financial services platform with multi-service forms, advanced conversion tracking, and accessibility-first architecture. 20+ service pages with centralized analytics.',
    gradient:
      'linear-gradient(135deg, rgb(37 99 235 / 0.4) 0%, rgb(30 64 175 / 0.35) 100%)',
    techStack: ['Next.js', 'React 19', 'Supabase', 'GA4'],
    imageSrc: toGradientDataUrl('#2563eb', '#1e40af'),
  },
  {
    id: 'portpal-2',
    title: 'PortPal',
    description:
      'Mobile-first PWA for ILWU longshoremen to log shifts, track earnings, and monitor goals. Monorepo with Next.js web and React Native mobile sharing a Supabase backend.',
    gradient:
      'linear-gradient(135deg, rgb(217 119 6 / 0.4) 0%, rgb(146 64 14 / 0.35) 100%)',
    techStack: ['Next.js', 'React Native', 'Supabase', 'Expo'],
    imageSrc: toGradientDataUrl('#d97706', '#92400e'),
  },
]

const defaultProjectCard: ProjectCard = {
  id: 'fallback',
  title: 'Fallback Project',
  description: 'Fallback project description.',
  techStack: [],
  gradient:
    'linear-gradient(135deg, rgb(30 58 138 / 0.4) 0%, rgb(49 46 129 / 0.35) 100%)',
  imageSrc: toGradientDataUrl('#1e3a8a', '#312e81'),
}

function mapProjects(projects?: SanityProject[]): ProjectCard[] {
  if (!projects || projects.length === 0) {
    return fallbackProjects
  }

  return projects.map((project, index) => {
    const fallback =
      fallbackProjects[index % fallbackProjects.length]! ?? defaultProjectCard

    const result: ProjectCard = {
      id: project._id,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      gradient: fallback.gradient,
      imageSrc: project.image?.asset?.url || fallback.imageSrc,
    }

    if (fallback.hoverImageSrc) {
      result.hoverImageSrc = fallback.hoverImageSrc
    }

    if (fallback.videoSrc) {
      result.videoSrc = fallback.videoSrc
    }

    return result
  })
}

export function Projects({ projects }: ProjectsProps) {
  const projectCards = mapProjects(projects)
  const isProjectDetailDialogOpen = useProjectDetailDialogOpen()

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const activeDetail =
    activeProjectId !== null ? getProjectDetailById(activeProjectId) : undefined

  const handleProjectCardActivation = (
    projectId: string,
    trigger: HTMLButtonElement
  ) => {
    if (!hasProjectDetail(projectId)) return
    triggerRef.current = trigger
    setActiveProjectId(projectId)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setActiveProjectId(null)
      // Return focus to the originating trigger after the dialog closes
      const trigger = triggerRef.current
      if (trigger) {
        requestAnimationFrame(() => {
          trigger.focus()
        })
        triggerRef.current = null
      }
    }
  }

  return (
    <section id="projects" className={s.section} data-testid="projects-section">
      <div className="dr-layout-block">
        <ProjectsHeading />
        <ProjectsGrid className={s.grid}>
          {projectCards.map((project) => (
            <article
              key={project.id}
              className={s.card}
              data-project-id={project.id}
              data-has-detail={hasProjectDetail(project.id) || undefined}
            >
              <div aria-hidden="true" className={s.imageArea}>
                {project.videoSrc ? (
                  <VideoAutoplay
                    className={s.imageEffect}
                    src={project.videoSrc}
                    suspended={isProjectDetailDialogOpen}
                  />
                ) : (
                  <ProjectCardMedia
                    className={s.imageEffect}
                    style={{
                      backgroundImage: toBackgroundImage(project.imageSrc),
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                    imageSrc={toPreferredMediaSource(project.imageSrc)}
                    suspended={isProjectDetailDialogOpen}
                    {...(project.hoverImageSrc
                      ? {
                          hoverImageSrc: toPreferredMediaSource(
                            project.hoverImageSrc
                          ),
                        }
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
              <button
                type="button"
                data-testid="project-card-trigger"
                aria-label={`View details for ${project.title}`}
                className={s.trigger}
                onClick={(e) =>
                  handleProjectCardActivation(project.id, e.currentTarget)
                }
              />
            </article>
          ))}
        </ProjectsGrid>
      </div>

      <ProjectDetailDialog
        open={activeDetail !== undefined}
        onOpenChange={handleDialogOpenChange}
        title={activeDetail?.displayTitle ?? ''}
      >
        {activeDetail ? <ProjectDetailContent detail={activeDetail} /> : null}
      </ProjectDetailDialog>
    </section>
  )
}

function ProjectDetailContent({
  detail,
}: {
  detail: NonNullable<ReturnType<typeof getProjectDetailById>>
}) {
  return (
    <div className={s.detailContent}>
      {detail.primaryVideoUrl ? (
        <ModalVideoPlayer
          src={detail.primaryVideoUrl}
          title={`${detail.displayTitle} demo`}
        />
      ) : null}

      {detail.galleryImages && detail.galleryImages.length > 0 ? (
        <ModalImageCarousel images={detail.galleryImages} />
      ) : null}

      <p className={s.detailSummary}>{detail.portfolioSummary}</p>

      {detail.highlights.length > 0 ? (
        <div className={s.detailSection}>
          <h4 className={s.detailSectionHeading}>Highlights</h4>
          <ul className={s.detailHighlights}>
            {detail.highlights.map((highlight) => (
              <li key={highlight} className={s.detailHighlight}>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.techStack.length > 0 ? (
        <div className={s.detailSection}>
          <h4 className={s.detailSectionHeading}>Tech Stack</h4>
          <div className={s.detailTechStack}>
            {detail.techStack.map((tech) => (
              <span key={tech} className={s.detailTechTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {detail.narrative ? (
        <div className={s.detailSection}>
          {detail.narrative.body ? (
            <p className={s.detailNarrativeBody}>{detail.narrative.body}</p>
          ) : null}
          {detail.narrative.sections?.map((section) => (
            <div key={section.heading} className={s.detailNarrativeSection}>
              <h4 className={s.detailSectionHeading}>{section.heading}</h4>
              <p className={s.detailNarrativeBody}>{section.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {(detail.links.live ?? detail.links.github ?? detail.links.demo) ? (
        <div className={s.detailLinks}>
          {detail.links.live ? (
            <Link
              href={detail.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={s.detailLink}
            >
              Live Site
            </Link>
          ) : null}
          {detail.links.github ? (
            <Link
              href={detail.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={s.detailLink}
            >
              GitHub
            </Link>
          ) : null}
          {detail.links.demo ? (
            <Link
              href={detail.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={s.detailLink}
            >
              Demo
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
