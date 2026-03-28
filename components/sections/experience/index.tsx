'use client'

import cn from 'clsx'
import { HoverImageReveal } from '@/components/effects/hover-image-reveal'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import s from './experience.module.css'

interface ExperienceEntry {
  _id?: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string
}

interface ExperienceProps {
  experiences?: ExperienceEntry[]
}

const defaultExperiences: ExperienceEntry[] = [
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
    role: 'Software Engineering Intern',
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
    role: 'Software Engineering Intern',
    startDate: '2024-04',
    endDate: '2024-12',
    current: false,
    description:
      'Built and maintained White Board ITS, a work day management web app used by 117 IT staffs. Deployed 11 new features, reducing task delegation time by 75% for daily users.',
  },
]

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function formatDate(dateStr: string): string {
  const [year, monthStr] = dateStr.split('-')
  const month = Number.parseInt(monthStr ?? '1', 10)
  const monthName = MONTH_NAMES[month - 1] ?? 'Jan'
  return `${monthName} ${year ?? ''}`
}

function formatEndDate(endDate: string | null, current: boolean): string {
  if (current) return 'Present'
  if (endDate) return formatDate(endDate)
  return ''
}

function formatDateRange(
  startDate: string,
  endDate: string | null,
  current: boolean
): string {
  const start = formatDate(startDate)
  const end = formatEndDate(endDate, current)
  return `${start} — ${end}`
}

export function Experience({
  experiences = defaultExperiences,
}: ExperienceProps) {
  const displayExperiences =
    experiences.length > 0 ? experiences : defaultExperiences

  return (
    <section
      id="experience"
      className={cn(s.experience)}
      data-testid="experience-section"
    >
      <div className={cn(s.inner)}>
        <div className={cn(s.headingWrapper)}>
          <h2 className={cn(s.heading, 'heading-lg')}>Experience</h2>
        </div>
      </div>

      <Marquee repeat={4} speed={0.5} className={s.logoMarquee}>
        <div className={s.logoTrack}>
          <HoverImageReveal
            src="/hover-previews/real-pics/headstarter1.61.png"
            alt="Headstarter preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://headstarter.co" target="_blank">
                <Image
                  src="/company-logo/work-experience/headstarter.png"
                  alt="Headstarter"
                  width={623}
                  height={211}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/tinyfish1.61.png"
            alt="Tinyfish preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://tinyfish.ai" target="_blank">
                <Image
                  src="/company-logo/work-experience/tinyfish.png"
                  alt="Tinyfish"
                  width={478}
                  height={105}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/bli1.61.png"
            alt="BLI preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://buildlaunchiterate.ca" target="_blank">
                <Image
                  src="/company-logo/work-experience/bli.png"
                  alt="BLI"
                  width={800}
                  height={260}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/douglascollege1.61.png"
            alt="Douglas College preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://douglascollege.ca" target="_blank">
                <Image
                  src="/company-logo/work-experience/douglas-college-white-text.png"
                  alt="Douglas College"
                  width={800}
                  height={260}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
        </div>
      </Marquee>

      <div className={cn(s.inner)}>
        <div className={cn(s.timeline)}>
          {displayExperiences.map((entry) => (
            <div key={entry._id || entry.company} className={cn(s.entry)}>
              <div
                className={cn(s.entryDot)}
                data-current={entry.current ? 'true' : undefined}
              />

              <h3 className={cn(s.company, 'heading-md')}>{entry.role}</h3>
              <p className={cn(s.role, 'body-lg')}>{entry.company}</p>
              <p className={cn(s.date, 'label')}>
                {formatDateRange(entry.startDate, entry.endDate, entry.current)}
              </p>
              <p className={cn(s.description, 'body-sm')}>
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(s.inner)}>
        <div className={cn(s.otherHeadingWrapper)}>
          <h3 className={cn(s.otherHeading, 'heading-md')}>
            Other Experiences
          </h3>
        </div>
      </div>

      <Marquee repeat={4} speed={0.5} className={s.logoMarquee}>
        <div className={s.logoTrack}>
          <HoverImageReveal
            src="/hover-previews/real-pics/smart-math-bc1.61.png"
            alt="Smart Math BC preview"
          >
            <span className={s.logoTrigger}>
              <Link
                href="https://www.linkedin.com/company/smart-math-bc"
                target="_blank"
              >
                <Image
                  src="/company-logo/other-experience/smart-math.png"
                  alt="Smart Math BC"
                  width={800}
                  height={260}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/costco1.61.png"
            alt="Costco preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://www.costco.ca" target="_blank">
                <Image
                  src="/company-logo/other-experience/costco.png"
                  alt="Costco"
                  width={1280}
                  height={459}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/thai-by-thai1.61.png"
            alt="Thai by Thai preview"
          >
            <span className={s.logoTrigger}>
              <Link href="#" target="_blank">
                <Image
                  src="/company-logo/other-experience/thai-by-thai.png"
                  alt="Thai by Thai"
                  width={691}
                  height={361}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/mtu1.61.png"
            alt="MTU Aero preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://www.mtu.de" target="_blank">
                <Image
                  src="/company-logo/other-experience/mtu.png"
                  alt="MTU Aero Engines"
                  width={1280}
                  height={622}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/naka-bistro1.61.png"
            alt="Naka Bistro preview"
          >
            <span className={s.logoTrigger}>
              <Link href="#" target="_blank">
                <Image
                  src="/company-logo/other-experience/naka-bistro.png"
                  alt="Naka Bistro"
                  width={225}
                  height={225}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/veym1.61.png"
            alt="VEYM preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://veym.net" target="_blank">
                <Image
                  src="/company-logo/other-experience/veym.png"
                  alt="VEYM"
                  width={800}
                  height={260}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/vancouver-dev1.61.png"
            alt="Vancouver Dev preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://vancouver.dev" target="_blank">
                <Image
                  src="/company-logo/other-experience/vancouver.dev.png"
                  alt="Vancouver Dev"
                  width={1128}
                  height={191}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
          <HoverImageReveal
            src="/hover-previews/real-pics/ai-tinkerers1.61.png"
            alt="AI Tinkerers preview"
          >
            <span className={s.logoTrigger}>
              <Link href="https://aitinkerers.org" target="_blank">
                <Image
                  src="/company-logo/other-experience/ai-tinkerers.png"
                  alt="AI Tinkerers"
                  width={1181}
                  height={211}
                  className={s.logo}
                />
              </Link>
            </span>
          </HoverImageReveal>
        </div>
      </Marquee>

      <div className={cn(s.inner)}>
        <div className={s.otherContent}>
          <div className={s.otherEntry}>
            <p className={cn(s.otherCompany, 'body-lg')}>Founder</p>
            <p className={cn(s.otherRole, 'body-sm')}>
              Smart Math BC · Jan 2019–Present
            </p>
            <p className={cn(s.otherDescription, 'body-sm')}>
              I pitch and sell to moms. I teach kids to do math. Your kid will
              improve in Math after 1 month, or your money back.
            </p>
          </div>
                    <div className={s.otherEntry}>
            <p className={cn(s.otherCompany, 'body-lg')}>Gas Turbine Technician Intern</p>
            <p className={cn(s.otherRole, 'body-sm')}>
              MTU Aero Engines · May 2022–Jun 2022
            </p>
            <p className={cn(s.otherDescription, 'body-sm')}>
              I help taking apart a HUGE airplane engine and putting it back
              together.
            </p>
          </div>

                    <div className={s.otherEntry}>
            <p className={cn(s.otherCompany, 'body-lg')}>Youth Leader</p>
            <p className={cn(s.otherRole, 'body-sm')}>
              Vietnamese Eucharist Youth Movement · Jan 2019–Present
            </p>
            <p className={cn(s.otherDescription, 'body-sm')}>
              Teach kids about Jesus & Catholic faith. Hosted 10+ summer camps, retreats, countless lessons & activities. My public speaking is natural at this point. 
            </p>
          </div>

          <div className={s.otherEntry}>
            <p className={cn(s.otherCompany, 'body-lg')}> Campus Ambassador</p>
            <p className={cn(s.otherRole, 'body-sm')}>
              Vancouver.dev · Oct 2023-Present
            </p>
            <p className={cn(s.otherDescription, 'body-sm')}>
                Helped hosted 10+ technical community events with speakers from FAANG and Fortune 500
            </p>
          </div>
          <div className={s.otherEntry}>
            <p className={cn(s.otherCompany, 'body-lg')}>Core Team Member</p>
            <p className={cn(s.otherRole, 'body-sm')}>
              AI Tinkerers · Feb 2026-Present
            </p>
            <p className={cn(s.otherDescription, 'body-sm')}>
              Helped hosted 3+ events within 1 month, vetted speakers from FAANG and Fortune 500
            </p>
          </div>
        </div>

        <p className={cn(s.activitiesLine, 'label')}>
          Insider scoop: Building NotionCode - let your whole team ship code without ever leaving Notion. Building TrueWeapon - Block NSFW content on X and Reddit without blocking the entire sites
        </p>
      </div>
    </section>
  )
}
