import { Wrapper } from '@/components/layout/wrapper'

export default function Home() {
  return (
    <Wrapper theme="dark" lenis={{}}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-bold text-4xl">Portfolio</h1>
          <p className="mt-4 text-gray-400 text-lg">Ready to build</p>
        </div>
      </div>
    </Wrapper>
  )
}
