'use client'

import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { ProjectDetailDialog } from '@/components/ui/project-detail-dialog'
import { projectProof } from '@/lib/content/site-content'
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

export function ProjectDetailContent({
  project,
  open,
  onOpenChange,
}: ProjectDetailContentProps) {
  const bullets = projectProof[project.id] ?? []

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
              <h4 className={cn(s.sectionTitle, 'label')}>Proof</h4>
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
