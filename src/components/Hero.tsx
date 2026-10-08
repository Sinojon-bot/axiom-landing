import { ArrowRight, Play } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import { HeroVisual } from './HeroVisual'

type Props = {
  onTryDemo: () => void
}

export function Hero({ onTryDemo }: Props) {
  const { t } = useLanguage()

  return (
    <section id="top" className="relative min-h-[min(92dvh,920px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="orb-drift absolute -left-28 top-8 h-[22rem] w-[22rem] rounded-full bg-violet/25 blur-[120px]" />
        <div
          className="orb-drift absolute -right-20 bottom-10 h-[26rem] w-[26rem] rounded-full bg-violet-dim/30 blur-[130px]"
          style={{ animationDelay: '-4s' }}
        />
        <div className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent)]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(139,108,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,108,255,0.06) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:min-h-[min(84dvh,820px)] lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="relative z-10 max-w-xl">
            <p className="section-kicker hero-reveal mb-5 sm:mb-6">{t.hero.eyebrow}</p>

            <h1 className="brand-mark hero-reveal-delay bg-gradient-to-br from-white via-violet-bright to-violet bg-clip-text text-[clamp(3.5rem,12vw,6.25rem)] leading-[0.88] text-transparent">
              AXIOM
            </h1>

            <p className="section-title hero-reveal-delay mt-5 max-w-[18ch] text-[1.45rem] text-text sm:mt-6 sm:text-[1.9rem] lg:text-[2.1rem]">
              {t.hero.headline}
            </p>

            <p className="hero-reveal-delay-2 mt-4 max-w-md text-[1.02rem] leading-[1.7] text-text-secondary sm:mt-5 sm:text-[1.05rem]">
              {t.hero.description}
            </p>

            <div className="hero-reveal-delay-2 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onTryDemo}
                className="btn-primary inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl px-8 text-[15px]"
              >
                <Play className="h-4 w-4" aria-hidden />
                {t.hero.primaryCta}
              </button>
              <a
                href="#features"
                className="btn-ghost inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 text-[15px] font-semibold"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {t.hero.secondaryCta}
                <ArrowRight className="h-4 w-4 text-text-secondary" aria-hidden />
              </a>
            </div>
          </div>

          <div className="hero-reveal-delay-2">
            <HeroVisual />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet/45 to-transparent"
        aria-hidden
      />
    </section>
  )
}
