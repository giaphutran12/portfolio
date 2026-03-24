import cn from 'clsx'
import type { CSSProperties } from 'react'
import { ProjectCardMedia } from '@/components/effects/project-card-media'
import type { Project as SanityProject } from '@/integrations/sanity/fetch'
import { ProjectCardVideoMedia } from './project-card-video-media'
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

const PROJECT_CARD_HOVER_LIFT_PX = 6

function toGradientDataUrl(colorA: string, colorB: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`
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

const fallbackProjects: ProjectCard[] = [
  {
    id: 'x-recommendation-algo',
    title: 'X Recommendation Algorithm',
    description:
      "Reverse-engineered X's recommendation engine to expose algorithmic bias and engagement patterns. Built a ML pipeline that decoded what makes content viral, then proved it.",
    gradient:
      'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(124 45 18 / 0.35) 100%)',
    techStack: ['Next.js', 'PyTorch', 'ONNX', 'Supabase'],
    imageSrc: '/project-pic/x-rec/x-rec1.avif',
    hoverImageSrc: '/project-pic/x-rec/X-REC2.avif',
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
    imageSrc: '/project-pic/viet-bike-scout/viet-bike-scout1.avif',
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
    imageSrc: '/project-pic/stolk/stolk1.avif',
    hoverImageSrc: '/project-pic/stolk/stolk2.avif',
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
    videoSrc: '/project-videos/self-improving-prompt.mp4',
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
    videoSrc: '/project-videos/web-assembly.mp4',
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
              style={projectCardLiftStyle}
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
            </article>
          ))}
        </ProjectsGrid>
      </div>
    </section>
  )
}
