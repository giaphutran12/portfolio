import { Wrapper } from '@/components/layout/wrapper'
import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'
import { Experience } from '@/components/sections/experience'
import { Hero } from '@/components/sections/hero'
import { Projects } from '@/components/sections/projects'
import {
  type Experience as ExperienceType,
  fetchExperience,
  fetchProjects,
  fetchSiteConfig,
  type Project,
} from '@/integrations/sanity/fetch'

export default async function Home() {
  const [projects, experiences, siteConfig] = await Promise.all([
    fetchProjects(),
    fetchExperience(),
    fetchSiteConfig(),
  ])

  return (
    <Wrapper theme="dark" lenis={{}}>
      <Hero name={siteConfig.name} tagline={siteConfig.tagline} />
      <Projects projects={projects as Project[]} />
      <Experience experiences={experiences as ExperienceType[]} />
      <About aboutText={siteConfig.aboutText} />
      <Contact
        email={siteConfig.email}
        githubUrl={siteConfig.githubUrl}
        linkedinUrl={siteConfig.linkedinUrl}
      />
    </Wrapper>
  )
}
