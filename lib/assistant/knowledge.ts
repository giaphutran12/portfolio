/**
 * Everything the site assistant knows about Edward.
 *
 * This is the single source of truth for the assistant. It is placed whole
 * inside the fixed system prompt, so keep it factual, public-safe and short
 * enough to read in one sitting. If a fact is not here, the assistant says it
 * does not know and offers to pass the question to Edward.
 *
 * Edit freely. Bump KNOWLEDGE_VERSION on every change so logs show which
 * version answered.
 */

export const KNOWLEDGE_VERSION = '2026-11-07.1'

export const EDWARD_KNOWLEDGE = `
## Who Edward is
- Edward Tran (GitHub: giaphutran12). Software engineer in Vancouver, BC, Canada.
- He builds AI tools that do real work, mostly by directing coding agents (Claude Code and Codex) rather than typing every line himself.
- Works at Build Launch Iterate (BLI), a Vancouver startup, since August 2025. It was his first real job; he says his boss took a chance on him when others would not.
- Vietnamese-Canadian. Catholic, and his faith is central to how he works: he treats talent as something entrusted to him that he must not bury (the parable of the talents). He signs his posts "Ave Christus Rex".
- How he describes his aim: become excellent without losing his soul.
- He prefers "Saigon" to "Ho Chi Minh City".

## What he is proudest of: Tower
- Tower is the operating system Build Launch Iterate runs on: tickets, docs, chat, mail, calendar, meeting notes and an assistant called JARVIS, all on one backend.
- Every feature works from the web app, a command line and Slack, and the same endpoints are exposed as MCP tools, so the team's coding agents work inside Tower next to the people.
- A collector on every teammate's machine (macOS and Windows) picks up Codex and Claude Code sessions, masks secrets before anything leaves the laptop, and feeds an LLM judge that turns the sessions into coaching for BLI's interns.
- Scale since April 2026: 2,700+ merged pull requests and 470 database migrations. About 2,500 of the roughly 3,000 commits are Edward's, most written by agents he runs. 300+ MCP tools, and a CLI on npm (@bli-cockpit/cli) past its 290th release.
- Stack: Next.js, Postgres on Supabase with row-level security, the Vercel AI SDK, Mastra, Railway.
- The code is private. Edward is happy to demo it on a call.
- The booking feature this chat uses to schedule a call with Edward runs on Tower's calendar.

## Other work at Build Launch Iterate
- PearlPortal: an enterprise CRM for mortgage brokers with AI call analysis and a loan proposal generator. It helped at least one firm leave Salesforce after 20 years. The loan proposal generator saves brokers about 2 hours a day.
- Rebuilt the company website to convert 3x better and load 2x faster.
- Audited backend auth: secured 7 unprotected API routes and enforced row-level security across 15 CRM tables.
- Runs technical and behavioural interviews for candidates and works with BLI's interns, so he has real opinions about which interview signals matter.

## Earlier experience
- TinyFish (San Francisco AI web-agent company), Software Engineering / Product Growth Intern, from March 2026. He got the role by building an app on the TinyFish API before his interview. As an intern he helped take the open-source tinyfish-cookbook from about 900 to 1,900+ GitHub stars, got TinyFish merged into OpenClaw as a bundled browser plugin, demoed at AI Tinkerers meetups and secured a sponsorship that funded a speaker's trip to a Vietnam meetup.
- Headstarter, Software Engineer Resident, from July 2025: 5+ AI and full-stack projects, 163+ commits on 7-day deadlines, coached by engineers from Google, Two Sigma, Tesla, Figma and Citadel.
- Douglas College IT, Software Engineering Intern, April to December 2024: built Whiteboard (White Board ITS), a work-day management app for 117 IT staff. Shipped 11 production features and cut task-delegation time by 75%. The department kept using it for years.
- Call Analysis: AI call intelligence built with 8 BCIT interns; placed 2nd at the ISSP Expo 2025.

## Education
- Computer Science at Douglas College, on the transfer path to Simon Fraser University (SFU). 4x honour roll, 1x Dean's List.

## Projects shown on this site (slug in brackets)
- X Recommendation Algorithm [x-recommendation-algo]: reverse-engineered how X's recommendation engine ranks posts and rebuilt the pipeline in TypeScript. Open source.
- Viet Bike Scout [viet-bike-scout]: compares motorbike rental prices across 18+ shops in Vietnam in seconds, using parallel browser agents for sites ordinary scrapers cannot handle.
- AutoResearch macOS [autoresearch-macos]: AI agents that run small-model training research overnight on a single machine, adapted for macOS.
- Twitter for Stocks [stocktwits-clone-2]: social platform for traders with LLM-scored insights under 1 second at about 0.1 cents per analysis; caching cut compute cost 70%.
- Self-Improving Prompt Engine [self-improving-prompt]: CI/CD for prompts. Evaluate, analyse failures, auto-improve in a loop; averaged a +42% score lift across 10,000+ prompts.
- Lovable Clone / AI Website Builder [lovable-clone]: AI code generator with sandboxed previews, auth, payments, background jobs and Postgres.
- AI Customer Support Agent [ai-customer-support]: support agent for a fintech using Firecrawl, Pinecone and VAPI voice calls; semantic search cut resource use about 80%.
- Serverless Image Style Transfer [serverless-style-transfer]: style transfer in the browser with Rust, WebAssembly and WebGPU; about 95% less server cost.

## Recent public projects (not shown as cards on this site)
- Rustify: moves JavaScript/TypeScript hot paths to Rust, with proof that behaviour did not change.
- Brand Guide Generator: a URL or company name in, a structured brand guide out (logo, colours, fonts, voice). Built on TinyFish.
- The Call (empirio-clone): a mobile game of historical business decisions with an evidence-grounded AI analyst.
- A Day at Ben Thanh: an interactive Three.js miniature of Saigon's Ben Thanh Market with animated street life.
- predict-trump: leakage-safe, paper-only research on forecasting Donald Trump's next statements for prediction markets.
- edward-agent-stack: his public setup and rules for running coding agents.
- His GitHub profile shows a nightly-refreshed list of recently merged pull requests: github.com/giaphutran12

## How he works
- Agents do most of the typing; Edward plans, reviews and decides. He favours a strong model as the planner and reviewer and cheaper agents for the implementation work.
- Ships fast, measures with real numbers, and prefers boring, proven tools over clever ones.
- Toolkit: TypeScript, Next.js, Postgres, Supabase, Vercel AI SDK, Mastra, Railway, Rust, Python, Claude Code, Codex.

## Life outside code
- Youth leader with VEYM (Vietnamese Eucharistic Youth Movement) since 2019; has hosted 10+ camps and retreats.
- Founded Smart Math BC in 2019, a small math tutoring business. One story he is proud of: he took on a student other tutors turned down, and the student went from about 87% to 99% on his final exam.
- Community: campus ambassador for Vancouver.dev (10+ technical events), core team member at AI Tinkerers since February 2026, and he has competed at hackathons such as LotusHacks in Saigon.
- Spent part of 2026 in Vietnam, where he recovered from dengue fever.
- Posts on LinkedIn about building, faith and life, and writes every post by hand.
- The ASCII portrait on his GitHub profile is from the steps of Saint Joseph's Oratory in Montreal.

## Contact
- Email: giaphutran012@gmail.com
- LinkedIn: linkedin.com/in/edwardtran123
- GitHub: github.com/giaphutran12
- Website: edwardtran.ca
- This chat can send Edward a message or book a 30-minute video call with him, after the visitor confirms.

## Things the assistant does not know
- Salary expectations, availability for new roles, and anything about BLI's clients beyond what is written above. For these, offer to pass the question to Edward.
`.trim()
