/**
 * The words on the site, in one place.
 *
 * Every section falls back to this file when Sanity is not configured, which is
 * how the live site runs today. Change copy here, not in the components.
 *
 * Every number below was checked against its source on 2026-11-26. Numbers
 * written as "2,500+" are floors, so they stay true as the real count grows.
 */

import type {
  Experience,
  Project,
  SiteConfig,
} from '@/integrations/sanity/fetch'

export const SITE_TITLE = 'Edward Tran — Software Engineer'

export const SITE_DESCRIPTION =
  'Edward Tran is a software engineer at Build Launch Iterate. He built most of Tower, the software the company runs on, by directing coding agents: 2,500+ of its 3,100+ merged pull requests are his.'

export const ABOUT_HEADING =
  "2,500+ of Tower's 3,100+ merged pull requests are mine."

export const CONTACT_HEADING = 'Want a demo of Tower? Email me.'

export const SIDE_QUESTS_LINE =
  "Side quests: DOOM you can play inside my GitHub README (4,492 screenshots, no JavaScript), a browser game about boiling the ocean, and a Codex port of Garry Tan's gstack."

export const defaultSiteConfig: SiteConfig = {
  _id: 'site-config',
  name: 'Edward Tran',
  tagline: 'Software engineer. I ship by directing coding agents.',
  aboutText: [
    "**I'm a software engineer at Build Launch Iterate, where I lead a team of 6 engineers.** Tower is the software the company runs on: tickets, docs, chat, mail, calendar, meeting notes and an assistant called JARVIS, on one backend. I built most of it.",
    '**Coding agents write most of my code. I direct them and answer for what ships.** Tower carries 3,800+ test files, 34 CI workflows and 518 database migrations. My GitHub shows 14,000+ contributions in 2026.',
    '**In July 2025 an 11-hour TypeScript tutorial took me about 60 hours, line by line.** Before that: a 60-hour Unreal Engine C++ course, and PHP for Douglas College IT. Now I direct agents on Tower and lead the team.',
  ].join('\n\n'),
  email: 'giaphutran012@gmail.com',
  githubUrl: 'https://github.com/giaphutran12',
  linkedinUrl: 'https://linkedin.com/in/edwardtran123',
}

export const defaultProjects: Project[] = [
  {
    _id: 'tower',
    title: 'Tower',
    slug: { current: 'tower' },
    description:
      'The software Build Launch Iterate runs on. Tickets, docs, chat, mail and calendar on one backend, where coding agents use the same features people do.',
    techStack: [
      'Next.js',
      'Postgres',
      'Supabase',
      'AI SDK',
      'Mastra',
      'Railway',
    ],
    order: 1,
  },
  {
    _id: 'bigset',
    title: 'BigSet',
    slug: { current: 'bigset' },
    description:
      "TinyFish's open-source dataset builder (1.7k stars). Type one sentence, get a live dataset researched by web agents. I fixed how it reports a run, and I'm making it work on the Claude or ChatGPT plan you already pay for.",
    techStack: ['TypeScript', 'Mastra', 'Convex', 'TinyFish'],
    githubUrl: 'https://github.com/tinyfish-io/bigset-oss',
    order: 2,
  },
  {
    _id: 'viet-bike-scout',
    title: 'Viet Bike Scout',
    slug: { current: 'viet-bike-scout' },
    description:
      'Motorbike rental prices across Vietnam, compared in seconds. Browser agents visit 18 rental shops in 4 cities and stream the prices back as each shop finishes.',
    techStack: ['Next.js', 'TinyFish', 'Supabase', 'Zod'],
    liveUrl: 'https://viet-bike-scout.vercel.app',
    githubUrl: 'https://github.com/giaphutran12/viet-bike-scout',
    order: 3,
  },
  {
    _id: 'x-recommendation-algo',
    title: 'X Recommendation Algorithm',
    slug: { current: 'x-recommendation-algo' },
    description:
      "X's open-sourced ranking pipeline, rebuilt in TypeScript. It narrows 50K tweets to a feed of 50, scored by a two-tower model I trained in PyTorch.",
    techStack: ['Next.js', 'PyTorch', 'ONNX', 'Supabase'],
    liveUrl: 'https://x-recommendation-algo.vercel.app',
    githubUrl: 'https://github.com/giaphutran12/x-recommendation-algo',
    order: 4,
  },
  {
    _id: 'predict-trump',
    title: 'Predict Trump',
    slug: { current: 'predict-trump' },
    description:
      'I fine-tuned Qwen to predict what Trump says next. Then I caught my own benchmark leaking the future, rebuilt it, and published the result: an off-the-shelf model still won.',
    techStack: ['Python', 'Qwen', 'Fireworks'],
    githubUrl: 'https://github.com/giaphutran12/predict-trump',
    order: 5,
  },
  {
    _id: 'brand-guide-generator',
    title: 'Brand Guide Generator',
    slug: { current: 'brand-guide-generator' },
    description:
      "Give it a company's URL, or just its name. Get back a brand guide: logo, colours, fonts, tone of voice. Every quote it cites is checked against the page it came from.",
    techStack: ['Next.js', 'TinyFish', 'Playwright', 'OpenAI'],
    liveUrl: 'https://brand-guide-generator.vercel.app',
    githubUrl: 'https://github.com/giaphutran12/brand-guide-generator',
    order: 6,
  },
  {
    _id: 'stocktwits-clone-2',
    title: 'Stolk',
    slug: { current: 'stocktwits-clone-2' },
    description:
      'Twitter for stock traders. Tag a $TICKER, mark the post Bullish or Bearish, and Claude sums up what the crowd is saying.',
    techStack: ['Next.js', 'Prisma', 'Clerk', 'Claude'],
    liveUrl: 'https://stocktwits-clone-2.vercel.app',
    githubUrl: 'https://github.com/giaphutran12/stocktwits-clone-2',
    order: 7,
  },
  {
    _id: 'self-improving-prompt',
    title: 'Self-Improving Prompt Engine',
    slug: { current: 'self-improving-prompt' },
    description:
      'You write a prompt and a few test cases. It scores the prompt, works out what went wrong, rewrites it, and repeats until it passes.',
    techStack: ['Next.js', 'FastAPI', 'Gemini', 'Redis'],
    githubUrl: 'https://github.com/giaphutran12/self-improving-prompt',
    order: 8,
  },
  {
    _id: 'ai-customer-support',
    title: 'AI Customer Support Agent',
    slug: { current: 'ai-customer-support' },
    description:
      "A support bot that answers from a company's own website. It scrapes the pages with Firecrawl, searches them in Pinecone, and takes voice calls through Vapi.",
    techStack: ['Next.js', 'Firecrawl', 'Pinecone', 'Vapi'],
    githubUrl: 'https://github.com/giaphutran12/ai-customer-support-agent-aven',
    order: 9,
  },
  {
    _id: 'lovable-clone',
    title: 'Lovable Clone',
    slug: { current: 'lovable-clone' },
    description:
      'Where I started. In July 2025 I learned TypeScript by cloning Lovable from an 11-hour tutorial. It took me about 60 hours, line by line.',
    techStack: ['Next.js', 'tRPC', 'Prisma', 'E2B', 'Inngest'],
    liveUrl: 'https://vibe-saas-psi.vercel.app',
    githubUrl: 'https://github.com/giaphutran12/vibe-saas',
    order: 10,
  },
]

/** What the detail dialog lists under "Proof", by project id. */
export const projectProof: Record<string, string[]> = {
  tower: [
    '2,500+ of its 3,100+ merged pull requests since April 2026 are mine.',
    'What a person can click, a coding agent can call: the web app, a CLI, Slack and 400+ MCP tools.',
    '3,800+ test files, 34 CI workflows and 518 database migrations.',
    'One fix I like: a production query went from 22 seconds to 73 milliseconds by making it use an index that already existed.',
    "A collector on each teammate's laptop masks secrets on the machine. An LLM judge then turns their Codex and Claude Code sessions into coaching.",
    'The code is private. Ask me for a demo.',
  ],
  bigset: [
    'Not my repo: BigSet belongs to TinyFish. 4 of my pull requests are on main.',
    "Pull request #85 moved run status to the backend and blocks the duplicate runs that used to clear a dataset's rows.",
    'Open now, #168: every model call goes through your signed-in Claude Code or Codex CLI. No API key.',
    'While testing #168 I found the Codex agent could read local files, and closed that. The pull request reports input falling from about 337K to 106K tokens per row.',
  ],
  'viet-bike-scout': [
    'Merged into tinyfish-cookbook (2.3k stars).',
    '18 shops, each with its own site, layout and currency. No aggregator lists them.',
    'Results stream in as each shop finishes, so the first prices show up before the last agent is done.',
  ],
  'x-recommendation-algo': [
    'Two-tower neural network trained on 676K samples, exported to ONNX and run from TypeScript.',
    '10 filters and 4 scorers sit between 50K candidate tweets and the final 50.',
    "The data is synthetic: generated tweets and simulated engagement. It shows the pipeline working, not X's real feed.",
  ],
  'predict-trump': [
    'Three fine-tunes. The largest ran on 28,010 examples.',
    '157 of 560 test contracts opened before their training labels were known. I threw that benchmark out and built one that cannot peek ahead.',
    'The repo says it plainly: the first fine-tune was rejected, an untuned Kimi K2.6 won, and both promotion gates still fail.',
    'Total spend: $23.66.',
  ],
  'brand-guide-generator': [
    'A live run takes 35 to 105 seconds.',
    'A quote that is not on the source page word for word is dropped in code.',
    'Three TinyFish endpoints do the extraction: Search, Fetch and Browser.',
  ],
  'stocktwits-clone-2': [
    'Posts pick up $TICKER tags automatically.',
    'Every ticker shows its Bullish, Bearish and Neutral split.',
    'Claude reads the quality posts and pulls out the key themes.',
  ],
  'self-improving-prompt': [
    'One agent works out why the prompt failed. Another rewrites it.',
    'Feedback like "too formal" becomes a new test case.',
    'It loops until the prompt scores 90%, or you stop it.',
  ],
  'ai-customer-support': [
    'Scrapes and indexes the website on its own.',
    'Answers by text or by voice.',
  ],
  'lovable-clone': [
    '68 commits.',
    'AI code generation, a sandboxed preview, auth, billing and background jobs.',
    "Built by following Code With Antonio's tutorial.",
  ],
}

export const defaultExperience: Experience[] = [
  {
    _id: 'bli',
    company: 'Build Launch Iterate',
    role: 'Software Engineer',
    startDate: '2025-08',
    endDate: null,
    current: true,
    description:
      'I lead a team of 6 engineers and built most of Tower, the software the company runs on. 2,500+ of its 3,100+ merged pull requests since April 2026 are mine. Every feature works from the web app, a CLI, Slack and 400+ MCP tools, so coding agents work next to the people.',
  },
  {
    _id: 'tinyfish',
    company: 'TinyFish',
    role: 'Software Engineering Intern',
    startDate: '2026-03',
    endDate: null,
    current: true,
    description:
      'Wrote the first version of the TinyFish browser plugin that now ships in OpenClaw (395k stars); the merged pull request builds on it. 8 merged pull requests in tinyfish-cookbook (2.3k stars), including Viet Bike Scout. 4 more on main in BigSet (1.7k stars).',
  },
  {
    _id: 'headstarter',
    company: 'Headstarter',
    role: 'Software Engineer Resident',
    startDate: '2025-07',
    endDate: null,
    current: true,
    description:
      'Built 5+ AI and full-stack projects against 7-day deadlines. LLM chaining, hyperparameter tuning and fine-tuning across 5+ models. Coached by engineers from Google ML, Two Sigma, Tesla and Figma.',
  },
  {
    _id: 'douglas-college',
    company: 'Douglas College',
    role: 'Software Engineer Intern',
    startDate: '2024-04',
    endDate: '2024-12',
    current: false,
    description:
      "Shipped version 4 of Whiteboard, the IT department's shift tracker, first built by other students in 2021. 117 IT staff used it. 11 new features cut task-delegation time by 75%.",
  },
]
