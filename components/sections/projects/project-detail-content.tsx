'use client'

import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { ProjectDetailDialog } from '@/components/ui/project-detail-dialog'
import { setProjectDetailDialogOpen } from '@/lib/hooks/use-project-detail-dialog-open'
import { ProjectCardVideoMedia } from './project-card-video-media'
import s from './project-detail-content.module.css'

interface ProjectDetailContentProps {
  project: ProjectCard
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface ProjectCard {
  id: string
  title: string
  description: string
  techStack: string[]
  gradient: string
  imageSrc: string
  hoverImageSrc?: string | undefined
  videoSrc?: string | undefined
  liveUrl?: string | undefined
  githubUrl?: string | undefined
}

const IMPACT_BULLETS: Record<string, string[]> = {
  'x-recommendation-algo': [
    'Reverse-engineered X recommendation behavior using real engagement data.',
    'Built a full ML pipeline in PyTorch and exported to ONNX for inference.',
    'Proved algorithmic patterns that correlate with viral content distribution.',
  ],
  'viet-bike-scout': [
    'Aggregated real-time pricing across 18+ motorcycle rental shops in Vietnam.',
    'Handled login walls and dynamic content that break traditional scrapers.',
    'Normalized messy, unstructured marketplace data into clean, comparable listings.',
  ],
  'autoresearch-macos': [
    'Native macOS app built in Swift that browses, reads, and synthesizes research.',
    'Turns 10+ hours of manual reading into structured reports in minutes.',
    'Designed for deep-work researchers who need synthesized knowledge fast.',
  ],
  'stocktwits-clone-2': [
    'Real-time WebSocket feeds for live market data and social sentiment.',
    'Built for traders who want to gauge crowd opinion before executing trades.',
    'Full-stack implementation with auth, database, and realtime infrastructure.',
  ],
  'self-improving-prompt': [
    'Averaged +42% score lift across 10K+ prompts via automated eval loops.',
    'Multi-agent feedback pipeline that evaluates failures and iterates prompts.',
    'Effectively CI/CD for prompts — deploy, measure, improve, repeat.',
  ],
  'lovable-clone': [
    'Full-stack AI code generator with sandboxed preview environment.',
    'Wired auth, payments, background jobs, Postgres, and type safety end-to-end.',
    'Demonstrates ability to ship complete product surfaces, not just demos.',
  ],
  'ai-customer-support': [
    'Context-aware support agent for fintech using Firecrawl and Pinecone RAG.',
    'Handles voice calls via VAPI and reduces support overhead by ~80%.',
    'Scrapes docs, indexes vectors, and resolves issues autonomously.',
  ],
  'serverless-style-transfer': [
    'Runs neural style transfer entirely in-browser using Rust and WebAssembly.',
    'Zero backend compute required — 95% cost reduction vs server-side inference.',
    'Proof of performance-minded engineering and low-level systems curiosity.',
  ],
  'intelligent-llm-router': [
    'Smart intent analysis routes requests to the optimal model for the task.',
    '~100ms routing overhead with significant quality and cost improvements.',
    'Coding tasks to Claude, simple chat to free models, complex reasoning to GPT.',
  ],
}

export function ProjectDetailContent({
  project,
  open,
  onOpenChange,
}: ProjectDetailContentProps) {
  const bullets = IMPACT_BULLETS[project.id] || []

  const handleOpenChange = (nextOpen: boolean) => {
    setProjectDetailDialogOpen(nextOpen)
    onOpenChange(nextOpen)
  }

  return (
    <ProjectDetailDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={project.title}
    >
      <div className={s.root}>
        {project.videoSrc ? (
          <div className={s.media}>
            <ProjectCardVideoMedia
              className={s.video}
              poster={project.imageSrc}
              src={project.videoSrc}
            />
          </div>
        ) : (
          <div
            className={s.media}
            style={{
              backgroundImage: `url("${project.imageSrc}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
        )}

        <div className={s.body}>
          <p className={cn(s.description, 'body-md')}>{project.description}</p>

          {bullets.length > 0 && (
            <div className={s.section}>
              <h4 className={cn(s.sectionTitle, 'label')}>Impact</h4>
              <ul className={s.bullets}>
                {bullets.map((bullet) => (
                  <li key={bullet} className={cn(s.bullet, 'body-sm')}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={s.section}>
            <h4 className={cn(s.sectionTitle, 'label')}>Tech Stack</h4>
            <ul className={s.tags}>
              {project.techStack.map((tech) => (
                <li key={tech} className={cn(s.tag, 'label')}>
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          {(project.liveUrl || project.githubUrl) && (
            <div className={s.links}>
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(s.link, 'body-sm')}
                >
                  Live Demo →
                </Link>
              )}
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(s.link, 'body-sm')}
                >
                  GitHub →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </ProjectDetailDialog>
  )
}
