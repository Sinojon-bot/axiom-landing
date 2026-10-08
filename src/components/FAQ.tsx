import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function FAQ() {
  const { t } = useLanguage()
  const reducedMotion = useReducedMotion()
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(t.faq.items[0]?.id ?? null)

  return (
    <section id="faq" className="section-shell" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="section-kicker mb-4">{t.faq.eyebrow}</p>
          <h2 id="faq-heading" className="section-title text-[2rem] sm:text-4xl lg:text-[2.75rem]">
            {t.faq.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            {t.faq.description}
          </p>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-white/[0.06] overflow-hidden rounded-[1.75rem] glass-panel">
          {t.faq.items.map((item) => {
            const open = openId === item.id
            const panelId = `${baseId}-panel-${item.id}`
            const buttonId = `${baseId}-button-${item.id}`
            return (
              <div key={item.id} className={open ? 'bg-white/[0.02]' : ''}>
                <h3>
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-text transition hover:text-violet-bright sm:px-6 sm:text-base"
                    aria-expanded={open}
                    aria-controls={panelId}
                    id={buttonId}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="pr-2">{item.question}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition-colors ${
                        open ? 'border-violet-bright/30 bg-violet/15' : ''
                      }`}
                    >
                      <Plus
                        className={`h-4 w-4 text-text-muted transition-transform duration-300 ${
                          open ? 'rotate-45 text-violet-bright' : ''
                        } ${reducedMotion ? 'transition-none' : ''}`}
                        aria-hidden
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    reducedMotion ? 'transition-none' : ''
                  } ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p
                      className="px-5 pb-5 text-sm leading-relaxed text-text-secondary sm:px-6 sm:text-[15px]"
                      {...(!open ? { inert: true } : {})}
                      aria-hidden={!open}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
