import cn from 'clsx'
import s from './projects.module.css'
import { ProjectsHeading } from './projects-heading'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  gradient: string
}

const projects: Project[] = [
  {
    id: 'x-recommendation-algo',
    title: 'X Recommendation Algorithm',
    description:
      'A machine learning pipeline that reverse-engineers content recommendation patterns on X, surfacing insights into algorithmic bias and engagement optimization.',
    gradient:
      'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(124 45 18 / 0.35) 100%)',
    techStack: ['Python', 'TensorFlow', 'FastAPI'],
  },
  {
    id: 'viet-bike-scout',
    title: 'Viet Bike Scout',
    description:
      'Real-time motorcycle marketplace aggregator for Vietnam, scraping and normalizing listings across platforms with intelligent price trend analysis.',
    gradient:
      'linear-gradient(135deg, rgb(6 78 59 / 0.4) 0%, rgb(19 78 74 / 0.35) 100%)',
    techStack: ['React Native', 'Expo', 'TypeScript'],
  },
  {
    id: 'autoresearch-macos',
    title: 'AutoResearch macOS',
    description:
      'An AI-powered research assistant for macOS that autonomously browses, reads, and synthesizes information from multiple sources into structured reports.',
    gradient:
      'linear-gradient(135deg, rgb(30 58 138 / 0.4) 0%, rgb(49 46 129 / 0.35) 100%)',
    techStack: ['Swift', 'macOS', 'LLM'],
  },
  {
    id: 'stocktwits-clone-2',
    title: 'StockTwits Clone',
    description:
      'A real-time social trading platform with live market data, sentiment analysis, and community-driven stock discussions powered by WebSocket streams.',
    gradient:
      'linear-gradient(135deg, rgb(88 28 135 / 0.4) 0%, rgb(131 24 67 / 0.35) 100%)',
    techStack: ['Next.js', 'PostgreSQL', 'WebSocket'],
  },
]

export function Projects() {
  return (
    <section id="projects" className={s.section} data-testid="projects-section">
      <div className="dr-layout-block">
        <ProjectsHeading />
        <div className={s.grid}>
          {projects.map((project) => (
            <article
              key={project.id}
              className={s.card}
              data-project-id={project.id}
            >
              <div
                aria-hidden="true"
                className={s.imageArea}
                style={{ background: project.gradient }}
              />
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
        </div>
      </div>
    </section>
  )
}
