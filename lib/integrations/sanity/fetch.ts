/**
 * Sanity CMS Data Fetching Layer
 *
 * Provides type-safe data fetching with automatic fallbacks to hardcoded defaults.
 * Gracefully handles missing Sanity configuration.
 */

import { isSanityConfigured } from '@/integrations/check-integration'
import {
  defaultExperience,
  defaultProjects,
  defaultSiteConfig,
} from '@/lib/content/site-content'
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
 * Default projects (fallback). The words live in lib/content/site-content.ts.
 */
function getDefaultProjects(): Project[] {
  return defaultProjects
}

/**
 * Default experience (fallback). The words live in lib/content/site-content.ts.
 */
function getDefaultExperience(): Experience[] {
  return defaultExperience
}

/**
 * Default site config (fallback). The words live in lib/content/site-content.ts.
 */
function getDefaultSiteConfig(): SiteConfig {
  return defaultSiteConfig
}
