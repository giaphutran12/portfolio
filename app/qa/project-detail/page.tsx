'use client'

import { useState } from 'react'
import { ProjectDetailDialog } from '@/components/ui/project-detail-dialog'

export default function ProjectDetailQA() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black p-8 text-white">
      <h1 className="font-bold text-2xl">Project Detail Dialog QA</h1>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-white px-4 py-2 font-medium text-black"
      >
        Open Dialog
      </button>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`bg-item-${i.toString()}`}
            className="flex h-32 items-center justify-center rounded-lg bg-white/10"
          >
            Background Content {i + 1}
          </div>
        ))}
      </div>

      <ProjectDetailDialog
        open={open}
        onOpenChange={setOpen}
        title="Blue Pearl Landing Page"
      >
        <div className="flex flex-col gap-6">
          <div className="flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <span className="text-white/50">Video/Image Placeholder</span>
          </div>
          <div className="space-y-4 text-white/80">
            <p>
              This is a test of the project detail dialog shell. It should be
              centered on both desktop and mobile.
            </p>
            <p>
              The backdrop should be visible and clicking it should close the
              dialog. The close button in the top right should also work.
            </p>
            <p>
              This body area should be scrollable if the content exceeds the
              maximum height of the dialog.
            </p>
            {Array.from({ length: 5 }).map((_, i) => (
              <p key={`content-${i.toString()}`}>
                More content to test scrolling... {i + 1}
              </p>
            ))}
          </div>
        </div>
      </ProjectDetailDialog>
    </div>
  )
}
