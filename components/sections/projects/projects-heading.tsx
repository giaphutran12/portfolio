'use client'

import cn from 'clsx'
import s from './projects.module.css'

export function ProjectsHeading() {
  return (
    <div className={s.headingWrap}>
      <p className={cn(s.eyebrow, 'label')}>Selected work</p>
      <h2 className={cn(s.heading, 'heading-lg')}>Projects</h2>
    </div>
  )
}
