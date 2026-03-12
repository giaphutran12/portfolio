import cn from 'clsx'
import { ImageTransition } from '@/components/effects/image-transition'
import type { Project as SanityProject } from '@/integrations/sanity/fetch'
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
}

interface ProjectsProps {
  projects?: SanityProject[]
}

function toGradientDataUrl(colorA: string, colorB: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const fallbackProjects: ProjectCard[] = [
  {
    id: 'x-recommendation-algo',
    title: 'X Recommendation Algorithm',
    description:
      'A machine learning pipeline that reverse-engineers content recommendation patterns on X, surfacing insights into algorithmic bias and engagement optimization.',
    gradient:
      'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(124 45 18 / 0.35) 100%)',
    techStack: ['Python', 'TensorFlow', 'FastAPI'],
    imageSrc: '/project-pic/x-rec/x-rec1.png',
    hoverImageSrc: '/project-pic/x-rec/X-REC2.png',
  },
  {
    id: 'viet-bike-scout',
    title: 'Viet Bike Scout',
    description:
      'Real-time motorcycle marketplace aggregator for Vietnam, scraping and normalizing listings across platforms with intelligent price trend analysis.',
    gradient:
      'linear-gradient(135deg, rgb(6 78 59 / 0.4) 0%, rgb(19 78 74 / 0.35) 100%)',
    techStack: ['React Native', 'Expo', 'TypeScript'],
    imageSrc: toGradientDataUrl('#065f46', '#115e59'),
  },
  {
    id: 'autoresearch-macos',
    title: 'AutoResearch macOS',
    description:
      'An AI-powered research assistant for macOS that autonomously browses, reads, and synthesizes information from multiple sources into structured reports.',
    gradient:
      'linear-gradient(135deg, rgb(30 58 138 / 0.4) 0%, rgb(49 46 129 / 0.35) 100%)',
    techStack: ['Swift', 'macOS', 'LLM'],
    imageSrc: toGradientDataUrl('#1e3a8a', '#312e81'),
  },
  {
    id: 'stocktwits-clone-2',
    title: 'StockTwits Clone',
    description:
      'A real-time social trading platform with live market data, sentiment analysis, and community-driven stock discussions powered by WebSocket streams.',
    gradient:
      'linear-gradient(135deg, rgb(88 28 135 / 0.4) 0%, rgb(131 24 67 / 0.35) 100%)',
    techStack: ['Next.js', 'PostgreSQL', 'WebSocket'],
    imageSrc: '/project-pic/stolk/stolk1.png',
    hoverImageSrc: '/project-pic/stolk/stolk2.png',
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
            >
              <div aria-hidden="true" className={s.imageArea}>
                <ImageTransition
                  className={s.imageEffect}
                  style={{
                    background: project.gradient,
                    backgroundImage: `url(${project.imageSrc})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                  imageSrc={project.imageSrc}
                  {...(project.hoverImageSrc
                    ? { hoverImageSrc: project.hoverImageSrc }
                    : {})}
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
