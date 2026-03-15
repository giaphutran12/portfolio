'use client'

import cn from 'clsx'
import s from './projects.module.css'

export function ProjectsHeading() {
  return <h2 className={cn(s.heading, 'heading-lg')}>Projects</h2>
}
