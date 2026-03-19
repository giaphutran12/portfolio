import type { ProjectDetail } from './types'

export const portpal2: ProjectDetail = {
  id: 'portpal-2',
  slug: 'portpal-2',
  displayTitle: 'PortPal',
  portfolioSummary:
    'Mobile-first progressive web app enabling ILWU longshoremen to log shifts, track earnings, monitor goals, and access real-time analytics. Built as a monorepo with Next.js web and React Native mobile apps sharing a unified Supabase backend.',
  highlights: [
    'Monorepo architecture: Next.js web + React Native mobile + shared TypeScript package',
    'Six shift entry types tailored to ILWU operations (worked, standby, dispatch, casual, training, other)',
    'Real-time analytics dashboard with Recharts for shift patterns and earnings trends',
    'Goal tracking system with visual progress indicators and historical comparisons',
    'Progressive Web App with offline support and installability',
    'Supabase PostgreSQL backend with row-level security and real-time subscriptions',
    'Mobile-first responsive design optimized for field workers',
    'Comprehensive testing: Vitest unit tests + Playwright E2E tests',
  ],
  techStack: [
    'Next.js 16',
    'React 19',
    'React Native',
    'Expo',
    'TypeScript 5',
    'Supabase',
    'PostgreSQL',
    'Tailwind CSS 4',
    'shadcn/ui',
    'Recharts',
    'Zod',
    'React Hook Form',
    'Vitest',
    'Playwright',
  ],
  links: {
    live: 'https://portpal-2.vercel.app',
    github: 'https://github.com/giaphutran12/portpal-2',
  },
  narrative: {
    body: 'PortPal is a purpose-built shift tracking platform for ILWU longshoremen, addressing the unique operational needs of port workers. The application enables workers to log various shift types, track earnings in real time, set personal goals, and access comprehensive analytics—all from a mobile-first interface designed for field use.',
    sections: [
      {
        heading: 'Monorepo Architecture',
        body: 'The project demonstrates a modern full-stack architecture: a monorepo housing both a Next.js web application and a React Native mobile app, with a shared TypeScript package containing business logic and type definitions. This structure ensures consistency across platforms while allowing platform-specific optimizations. The web app leverages Next.js 16 with React 19, Tailwind CSS, and shadcn/ui for a responsive, accessible interface. The mobile app uses Expo and React Native to deliver native performance on iOS and Android.',
      },
      {
        heading: 'Shift Logging & Analytics',
        body: 'Flexible shift entry system supporting six categories tailored to port operations: worked, standby, dispatch, casual, training, and other. An interactive analytics dashboard powered by Recharts displays shift patterns, earnings trends, and goal progress at a glance. Real-time data synchronization via Supabase ensures workers see up-to-date information across devices.',
      },
      {
        heading: 'Goal Tracking & PWA',
        body: 'Users set and monitor personal earning and shift goals with visual progress indicators and historical comparisons. Progressive Web App capabilities with offline-first support ensure workers can log shifts even without connectivity, with automatic sync when reconnected. The app is installable on home screens for quick access.',
      },
      {
        heading: 'Backend & Data',
        body: 'Supabase PostgreSQL backend provides row-level security, real-time subscriptions, and managed authentication. Database schema includes tables for users, shifts, goals, jobs, and locations. Comprehensive testing via Vitest for unit tests and Playwright for end-to-end scenarios ensures reliability for mission-critical shift tracking.',
      },
    ],
  },
  cardMedia: {
    gradient: 'from-amber-600 to-amber-800',
    imageSrc: '/projects/portpal-2.jpg',
  },
}
