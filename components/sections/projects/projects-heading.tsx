'use client'

import cn from 'clsx'
import s from './projects.module.css'

export function ProjectsHeading() {
  return (
    <div className={s.headingGroup}>
      <p className={cn(s.eyebrow, 'label')}>Selected work</p>
      <h2 className={cn(s.heading, 'heading-lg')}>Projects</h2>
      <p className={cn(s.headingLead, 'body-sm')}>
        Product-first systems I have shipped end-to-end — from interaction
        design to production delivery.
      </p>
    </div>
  )
}
