import type { ProjectDetail } from './types'

export const bluePearlLandingPage: ProjectDetail = {
  id: 'blue-pearl-landing-page',
  slug: 'blue-pearl-landing-page',
  displayTitle: 'Blue Pearl Mortgages & Investments',
  portfolioSummary:
    'Full-stack financial services platform with multi-service forms, advanced conversion tracking, and accessibility-first architecture.',
  highlights: [
    'Multi-service form architecture with centralized conversion tracking',
    'Advanced analytics: GA4, Google Ads, Google Tag Manager integration',
    'Accessibility-first: skip links, ARIA labels, semantic HTML',
    'Real-world conversion optimization with sessionStorage deduplication',
    'Responsive design across 20+ service pages',
    'Broker directory with dynamic routing',
    'Google reviews aggregation and testimonials',
    'Financial tools: debt and mortgage calculators',
  ],
  techStack: [
    'Next.js 16',
    'React 19',
    'TypeScript 5',
    'Tailwind CSS 4',
    'Radix UI',
    'React Hook Form',
    'Zod',
    'Supabase',
    'Google Analytics 4',
    'Google Tag Manager',
  ],
  links: {
    live: 'https://bluepearl.ca',
    github: 'https://github.com/giaphutran12/blue-pearl-landing-page',
  },
  narrative: {
    body: 'A comprehensive landing page platform serving Canadian homeowners seeking financial solutions. Blue Pearl offers mortgages, debt consolidation, financial stability planning, investments, insurance, RRSP, and accounting services—each with dedicated landing pages, forms, and conversion tracking.',
    sections: [
      {
        heading: 'Form Architecture',
        body: 'Centralized submission tracking via FormSubmissionTracker component. Every service form redirects to /[service]/thankyou, which fires conversion events to GA4, Google Ads, and GTM. Unique event names per form (fs_conversion, renewal_conversion) prevent cross-firing in GTM.',
      },
      {
        heading: 'Conversion Optimization',
        body: 'sessionStorage flags prevent duplicate tracking on page refresh. Client-side navigation tracking via TrackPageViews component fixes GTM History Change trigger that breaks with Next.js App Router. Enables marketers to self-service conversion tracking without developer involvement.',
      },
      {
        heading: 'Accessibility & Security',
        body: 'Skip-to-content link, ARIA labels on interactive elements, semantic HTML structure. CSP headers configured for Google domains. Middleware-enforced preview system (?preview=phillip-review-2025) for stakeholder compliance review.',
      },
      {
        heading: 'Component Patterns',
        body: 'Radix UI primitives with Tailwind CSS. QuickLoanForm supports standalone and embedded variants. Custom color tokens (Teal, Amber, Slate, Pearl). React Hook Form + Zod validation with SimpleLeadForm wrapper.',
      },
    ],
  },
  cardMedia: {
    gradient: 'from-blue-600 to-blue-800',
    imageSrc: '/projects/blue-pearl-landing-page.jpg',
  },
}
