/**
 * Sanity CMS Data Fetching Layer
 *
 * Provides type-safe data fetching with automatic fallbacks to hardcoded defaults.
 * Gracefully handles missing Sanity configuration.
 */

import { isSanityConfigured } from '@/integrations/check-integration'
import { client } from './client'
import {
  allExperienceQuery,
  allProjectsQuery,
  siteConfigQuery,
} from './queries'

/** Project data structure */
export interface Project {
  _id: string
  title: string
  slug: { current: string }
  description: string
  techStack: string[]
  image?: { asset?: { url: string } }
  liveUrl?: string
  githubUrl?: string
  order: number
}

/** Experience data structure */
export interface Experience {
  _id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string
}

/** Site config data structure */
export interface SiteConfig {
  _id: string
  name: string
  tagline: string
  aboutText: string
  email: string
  githubUrl: string
  linkedinUrl: string
}

/**
 * Fetch all projects from Sanity with fallback to hardcoded defaults
 */
export async function fetchProjects(): Promise<Project[]> {
  if (!(isSanityConfigured() && client)) {
    return getDefaultProjects()
  }

  try {
    const projects = await client.fetch<Project[]>(allProjectsQuery)
    return projects && projects.length > 0 ? projects : getDefaultProjects()
  } catch (error) {
    console.error('[SANITY] Failed to fetch projects:', error)
    return getDefaultProjects()
  }
}

/**
 * Fetch all experience entries from Sanity with fallback to hardcoded defaults
 */
export async function fetchExperience(): Promise<Experience[]> {
  if (!(isSanityConfigured() && client)) {
    return getDefaultExperience()
  }

  try {
    const experiences = await client.fetch<Experience[]>(allExperienceQuery)
    return experiences && experiences.length > 0
      ? experiences
      : getDefaultExperience()
  } catch (error) {
    console.error('[SANITY] Failed to fetch experience:', error)
    return getDefaultExperience()
  }
}

/**
 * Fetch site config from Sanity with fallback to hardcoded defaults
 */
export async function fetchSiteConfig(): Promise<SiteConfig> {
  if (!(isSanityConfigured() && client)) {
    return getDefaultSiteConfig()
  }

  try {
    const config = await client.fetch<SiteConfig | null>(siteConfigQuery)
    return config || getDefaultSiteConfig()
  } catch (error) {
    console.error('[SANITY] Failed to fetch site config:', error)
    return getDefaultSiteConfig()
  }
}

/**
 * Default hardcoded projects (fallback)
 */
function getDefaultProjects(): Project[] {
  return [
    {
      _id: 'x-recommendation-algo',
      title: 'X Recommendation Algorithm',
      slug: { current: 'x-recommendation-algo' },
      description:
        'A machine learning pipeline that reverse-engineers content recommendation patterns on X, surfacing insights into algorithmic bias and engagement optimization.',
      techStack: ['Python', 'TensorFlow', 'FastAPI'],
      order: 1,
    },
    {
      _id: 'viet-bike-scout',
      title: 'Viet Bike Scout',
      slug: { current: 'viet-bike-scout' },
      description:
        'Real-time motorcycle marketplace aggregator for Vietnam, scraping and normalizing listings across platforms with intelligent price trend analysis.',
      techStack: ['React Native', 'Expo', 'TypeScript'],
      order: 2,
    },
    {
      _id: 'autoresearch-macos',
      title: 'AutoResearch macOS',
      slug: { current: 'autoresearch-macos' },
      description:
        'An AI-powered research assistant for macOS that autonomously browses, reads, and synthesizes information from multiple sources into structured reports.',
      techStack: ['Swift', 'macOS', 'LLM'],
      order: 3,
    },
    {
      _id: 'stocktwits-clone-2',
      title: 'StockTwits Clone',
      slug: { current: 'stocktwits-clone-2' },
      description:
        'A real-time social trading platform with live market data, sentiment analysis, and community-driven stock discussions powered by WebSocket streams.',
      techStack: ['Next.js', 'PostgreSQL', 'WebSocket'],
      order: 4,
    },
  ]
}

/**
 * Default hardcoded experience (fallback)
 */
function getDefaultExperience(): Experience[] {
  return [
    {
      _id: 'company-a',
      company: 'Company A',
      role: 'Senior Full-Stack Developer',
      startDate: '2024-01',
      endDate: null,
      current: true,
      description:
        'Building scalable web applications with React, Next.js, and Node.js. Leading architecture decisions and mentoring junior developers across the team.',
    },
    {
      _id: 'company-b',
      company: 'Company B',
      role: 'Full-Stack Developer',
      startDate: '2022-06',
      endDate: '2024-01',
      current: false,
      description:
        'Developed and maintained production features for a high-traffic SaaS platform. Improved core web vitals by 40% through performance optimization work.',
    },
    {
      _id: 'company-c',
      company: 'Company C',
      role: 'Software Engineering Intern',
      startDate: '2021-05',
      endDate: '2022-05',
      current: false,
      description:
        'Contributed to the development of internal tooling and customer-facing features. Shipped multiple projects from design to production.',
    },
  ]
}

/**
 * Default hardcoded site config (fallback)
 */
function getDefaultSiteConfig(): SiteConfig {
  return {
    _id: 'site-config',
    name: 'Edward Tran',
    tagline: 'Full-Stack Developer',
    aboutText:
      "I'm a full-stack developer based in Houston, TX, with a passion for building products that live at the intersection of design and engineering.",
    email: 'edward@edwardtran.ca',
    githubUrl: 'https://github.com/edwardtran',
    linkedinUrl: 'https://linkedin.com/in/edwardtran',
  }
}
