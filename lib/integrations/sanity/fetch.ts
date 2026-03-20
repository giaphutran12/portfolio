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
    {
      _id: 'self-improving-prompt',
      title: 'Self-Improving Prompt Engine',
      slug: { current: 'self-improving-prompt' },
      description:
        'CI/CD for prompts — evaluate, analyze failures, auto-improve in a closed loop. Averaged +42% score lift on 10K+ prompts with multi-agent pipeline.',
      techStack: ['FastAPI', 'Redis', 'Gemini'],
      order: 5,
    },
    {
      _id: 'lovable-clone',
      title: 'Lovable Clone',
      slug: { current: 'lovable-clone' },
      description:
        'Full-stack Lovable clone — AI code gen, sandboxed preview, auth, payments, background jobs, type safety, and postgres all wired up.',
      techStack: ['Next.js', 'tRPC', 'E2B Sandbox'],
      order: 6,
    },
    {
      _id: 'ai-customer-support',
      title: 'AI Customer Support Agent',
      slug: { current: 'ai-customer-support' },
      description:
        'Context-aware AI support for fintech — Firecrawl scraping, Pinecone vector search, VAPI voice calls, Gemini embeddings. Reduced resource use by 80%.',
      techStack: ['Firecrawl', 'Pinecone', 'VAPI'],
      order: 7,
    },
    {
      _id: 'serverless-style-transfer',
      title: 'Serverless Image Style Transfer',
      slug: { current: 'serverless-style-transfer' },
      description:
        'Transform image styles on WebGPU using Rust and WebAssembly in the browser, reducing server-side cost by 95%. Zero backend required.',
      techStack: ['Rust', 'WebAssembly', 'WebGPU'],
      order: 8,
    },
  ]
}

/**
 * Default hardcoded experience (fallback)
 */
function getDefaultExperience(): Experience[] {
  return [
    {
      _id: 'bli',
      company: 'Build Launch Iterate',
      role: 'Software Engineer',
      startDate: '2025-08',
      endDate: null,
      current: true,
      description:
        'Audited backend auth, secured 7 unprotected API routes, and enforced RLS across 15 CRM tables. Built a Loan Proposal Generator to save brokers 2h/day. Rebuilt company website to convert 3x better and load 2x faster.',
    },
    {
      _id: 'tinyfish',
      company: 'TinyFish',
      role: 'Software Engineering + Growth Intern',
      startDate: '2026-03',
      endDate: null,
      current: true,
      description:
        "Shipped 1-2 apps/week using TinyFish browser agents to automate what scrapers can't — logins, paywalls, multi-step forms. Built Viet Bike Scout — parallel browser agents scraping 18+ rental shops with real-time pricing.",
    },
    {
      _id: 'headstarter',
      company: 'Headstarter',
      role: 'Software Engineer Resident',
      startDate: '2025-07',
      endDate: null,
      current: true,
      description:
        'Built 5+ AI engineering and fullstack projects in a fast-paced team. Implemented LLM-chaining, hyperparameter tuning, and fine-tuning on 5+ models. Coached by Google ML, Two Sigma, Tesla, and Figma engineers.',
    },
    {
      _id: 'douglas-college',
      company: 'Douglas College',
      role: 'Software Engineer Intern',
      startDate: '2024-04',
      endDate: '2024-12',
      current: false,
      description:
        'Built and maintained White Board ITS, a work day management web app used by 117 IT staffs. Deployed 11 new features, reducing task delegation time by 75% for daily users.',
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
    tagline: 'AI Engineer',
    aboutText:
      'AI Engineer who ships. Not "I watched a tutorial" ships. **Production apps, real users, actual problems solved.** Based in Vancouver, BC — transferred from Douglas College to SFU.\n\nFull-stack + AI focus — from backend auth to WebGL. TypeScript, Python, Next.js. Ships fast.\n\nBeyond code — founded **Smart Math BC** (7 yrs), VEYM youth leader (6 yrs), 4+ Medium blogs on AI.',
    email: 'giaphutran012@gmail.com',
    githubUrl: 'https://github.com/giaphutran12',
    linkedinUrl: 'https://linkedin.com/in/edwardtran123',
  }
}
