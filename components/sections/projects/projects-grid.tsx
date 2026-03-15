'use client'

interface ProjectsGridProps {
  children: React.ReactNode
  className?: string | undefined
}

export function ProjectsGrid({ children, className }: ProjectsGridProps) {
  return <div className={className}>{children}</div>
}
