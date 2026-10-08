import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Lightbulb } from 'lucide-react'
import { featureOrder, features, type FeatureId } from '../data/features'
import { CodeBlock } from './CodeBlock'
import { useLanguage } from '../i18n/LanguageProvider'

export function Features() {
  const { t } = useLanguage()
  const [active, setActive] = useState<FeatureId>('context')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const feature = features.find((f) => f.id === active)!
  const copy = t.features.items[active]

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      next = (index + 1) % featureOrder.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      next = (index - 1 + featureOrder.length) % featureOrder.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      next = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      next = featureOrder.length - 1
    } else {
      return
    }
    setActive(featureOrder[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="features" className="section-shell" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="section-kicker mb-4">{t.features.eyebrow}</p>
          <h2 id="features-heading" className="section-title text-[2rem] sm:text-4xl lg:text-[2.75rem]">
            {t.features.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            {t.features.description}
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] glass-panel neon-ring">
          <div
            role="tablist"
            aria-label={t.features.tabsLabel}
            className="flex gap-1 overflow-x-auto border-b border-white/[0.06] bg-white/[0.02] p-2.5"
          >
            {featureOrder.map((id, index) => {
              const selected = id === active
              const item = t.features.items[id]
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  className={`min-h-11 shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200 sm:px-4 ${
                    selected
                      ? 'bg-violet text-bg shadow-[0_10px_28px_-14px_rgba(139,108,255,0.9)]'
                      : 'text-text-secondary hover:bg-white/[0.04] hover:text-text'
                  }`}
                  onClick={() => setActive(id)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                >
                  {item.tabLabel}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel-${feature.id}`}
            aria-labelledby={`${baseId}-tab-${feature.id}`}
            className="grid gap-0 lg:grid-cols-2"
          >
            <div
              key={`copy-${feature.id}`}
              className="fade-in border-b border-white/[0.06] p-6 sm:p-8 lg:border-b-0 lg:border-r"
            >
              <h3 className="section-title text-2xl text-text sm:text-[1.65rem]">{copy.heading}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                {copy.description}
              </p>
              <div className="mt-7 flex gap-3 rounded-2xl border border-violet-bright/15 bg-violet/8 p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" aria-hidden />
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-violet-bright uppercase">
                    {t.features.benefitLabel}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text">{copy.benefit}</p>
                </div>
              </div>
            </div>

            <div key={`panel-${feature.id}`} className="fade-in bg-bg/25 p-4 sm:p-6">
              <div className="glass-terminal overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-3.5 py-2.5">
                  <p className="font-mono text-[11px] text-white/50">{copy.panelTitle}</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-bright pulse-glow" aria-hidden />
                </div>
                <div className="overflow-x-auto p-3.5">
                  <CodeBlock lines={feature.lines} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
