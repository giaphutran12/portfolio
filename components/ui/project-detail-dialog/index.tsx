'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import cn from 'clsx'
import type { ReactNode } from 'react'
import s from './project-detail-dialog.module.css'

export interface ProjectDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  title,
  children,
}: ProjectDetailDialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(s.backdrop)}
          data-testid="project-detail-backdrop"
        />
        <BaseDialog.Popup
          className={cn(s.popup)}
          data-testid="project-detail-popup"
        >
          <div className={cn(s.header)}>
            <BaseDialog.Title className={cn(s.title)}>{title}</BaseDialog.Title>
            <BaseDialog.Close
              className={cn(s.close)}
              data-testid="project-detail-close"
              aria-label="Close dialog"
            >
              <svg
                className={cn(s.closeIcon)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </BaseDialog.Close>
          </div>
          <div className={cn(s.body)}>{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
