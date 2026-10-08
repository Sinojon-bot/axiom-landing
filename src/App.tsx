import { useRef } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Demo, type DemoHandle } from './components/Demo'
import { Features } from './components/Features'
import { Pricing } from './components/Pricing'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { MatrixBackdrop } from './components/MatrixBackdrop'
import { CursorGlow } from './components/CursorGlow'

export default function App() {
  const demoRef = useRef<DemoHandle>(null)

  const tryDemo = () => {
    demoRef.current?.activate()
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-text">
      <MatrixBackdrop />
      <CursorGlow />
      <div className="pointer-events-none fixed inset-0 z-0 page-glow opacity-55" aria-hidden />
      <div className="grain pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10">
        <Navbar onTryDemo={tryDemo} />
        <main className="relative">
          <Hero onTryDemo={tryDemo} />
          <section className="section-shell">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Demo ref={demoRef} variant="section" />
            </div>
          </section>
          <Features />
          <Pricing />
          <FAQ />
        </main>
        <Footer />
      </div>
    </div>
  )
}
