'use client'

import { useState } from 'react'
import { Projects } from '@/components/sections/projects'
import { ModalImageCarousel } from '@/components/ui/modal-image-carousel'
import { ModalVideoPlayer } from '@/components/ui/modal-video-player'
import { ProjectDetailDialog } from '@/components/ui/project-detail-dialog'
import { projectDetails } from '@/lib/content/project-details'
import { useProjectDetailDialogOpen } from '@/lib/hooks/use-project-detail-dialog-open'

const qaCarouselImages = [
  {
    src: '/project-pic/self-improving-prompt/sip1.avif',
    alt: 'Self-improving prompt screenshot 1',
  },
  {
    src: '/project-pic/self-improving-prompt/sip2.avif',
    alt: 'Self-improving prompt screenshot 2',
  },
  {
    src: '/project-pic/web-assembly-image-style-transfer/ist1.avif',
    alt: 'WebAssembly image style transfer screenshot 1',
  },
  {
    src: '/project-pic/web-assembly-image-style-transfer/ist2.avif',
    alt: 'WebAssembly image style transfer screenshot 2',
  },
]

export default function ProjectDetailQA() {
  const [openId, setOpenId] = useState<string | null>(null)
  const isProjectDetailDialogOpen = useProjectDetailDialogOpen()

  const activeProject = projectDetails.find((p) => p.id === openId)

  return (
    <div className="min-h-dvh bg-black px-8 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <h1 className="font-bold text-2xl">Project Detail Dialog QA</h1>

        <div className="flex flex-wrap gap-4">
          {projectDetails.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setOpenId(project.id)}
              className="rounded-md bg-white px-4 py-2 font-medium text-black"
              data-testid={`open-${project.slug}`}
            >
              {project.displayTitle}
            </button>
          ))}
        </div>

        <p className="max-w-2xl text-sm text-white/70">
          Modal state: {isProjectDetailDialogOpen ? 'open' : 'closed'}
        </p>

        <section data-testid="carousel-qa-section">
          <h2 className="mb-4 font-semibold text-lg">Standalone Carousel QA</h2>
          <div className="mx-auto max-w-2xl">
            <ModalImageCarousel images={qaCarouselImages} />
          </div>
        </section>
      </div>

      <Projects projects={[]} />

      <ProjectDetailDialog
        open={openId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpenId(null)
        }}
        title={activeProject?.displayTitle ?? ''}
      >
        <div className="flex flex-col gap-6">
          {activeProject?.primaryVideoUrl ? (
            <ModalVideoPlayer
              src={activeProject.primaryVideoUrl}
              title={`${activeProject.displayTitle} demo`}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <span className="text-white/50">No video available</span>
            </div>
          )}
          <div className="space-y-4 text-white/80">
            <p>{activeProject?.portfolioSummary}</p>
            {activeProject?.highlights.map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
        </div>
      </ProjectDetailDialog>
    </div>
  )
}
