import { NoiseWaves } from '@/components/effects/noise-waves'
import { Wrapper } from '@/components/layout/wrapper'
import { About } from '@/components/sections/about'
import { Contact } from '@/components/sections/contact'
import { Experience } from '@/components/sections/experience'
import { Hero } from '@/components/sections/hero'
import { Projects } from '@/components/sections/projects'

export default function Home() {
  return (
    <Wrapper theme="dark" lenis={{}}>
      <NoiseWaves color="rgba(200, 169, 126, 0.08)" />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </Wrapper>
  )
}
