import { NoiseWaves } from '@/components/effects/noise-waves'
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
    <Wrapper theme="dark" lenis={{}} webgl>
      <NoiseWaves color="rgba(200, 169, 126, 0.08)" />
      <Hero name={siteConfig.name} tagline={siteConfig.tagline} />
      <About aboutText={siteConfig.aboutText} />
      <Projects projects={projects as Project[]} />
      <Experience experiences={experiences as ExperienceType[]} />
      <Contact
        email={siteConfig.email}
        githubUrl={siteConfig.githubUrl}
        linkedinUrl={siteConfig.linkedinUrl}
      />
    </Wrapper>
  )
}
