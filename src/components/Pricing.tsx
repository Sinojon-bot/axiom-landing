import { useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import {
  TEAM_SIZE_MAX,
  TEAM_SIZE_MIN,
  calcPricing,
  type BillingPeriod,
} from '../data/pricing'
import { useLanguage } from '../i18n/LanguageProvider'
import { fillTemplate, formatMoney } from '../i18n/format'
import { PlanDialog } from './PlanDialog'

function parseSeatInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  return n
}

export function Pricing() {
  const { t, locale } = useLanguage()
  const [period, setPeriod] = useState<BillingPeriod>('yearly')
  const [users, setUsers] = useState(3)
  const [inputValue, setInputValue] = useState('3')
  const [dialogOpen, setDialogOpen] = useState(false)
  const chooseRef = useRef<HTMLButtonElement>(null)

  const pricing = useMemo(() => calcPricing(period, users), [period, users])

  const applySeats = (value: number) => {
    const next = calcPricing(period, value).seats
    setUsers(next)
    setInputValue(String(next))
  }

  const onInputChange = (raw: string) => {
    setInputValue(raw)
    const parsed = parseSeatInput(raw)
    if (parsed === null) return
    const rounded = Math.round(parsed)
    if (rounded < TEAM_SIZE_MIN || rounded > TEAM_SIZE_MAX) return
    setUsers(rounded)
  }

  const onInputBlur = () => {
    const parsed = parseSeatInput(inputValue)
    if (parsed === null) {
      setInputValue(String(users))
      return
    }
    applySeats(parsed)
  }

  return (
    <section id="pricing" className="section-shell" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="section-kicker mb-4">{t.pricing.eyebrow}</p>
          <h2
            id="pricing-heading"
            className="section-title text-[2rem] sm:text-4xl lg:text-[2.75rem]"
          >
            {t.pricing.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            {t.pricing.description}
          </p>
        </div>

        <div className="mb-8 overflow-hidden rounded-[1.75rem] glass-panel neon-ring">
          <div className="border-b border-white/[0.06] bg-gradient-to-r from-violet/18 via-violet/5 to-transparent px-5 py-5 sm:px-7">
            <p className="text-sm font-semibold text-text">{t.pricing.calculatorTitle}</p>
            <p className="mt-1.5 text-sm text-text-secondary">{t.pricing.calculatorHint}</p>
          </div>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-7">
              <div>
                <p className="mb-2.5 text-xs font-medium tracking-wide text-text-muted uppercase">
                  {t.pricing.billing}
                </p>
                <div
                  className="inline-flex flex-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-1"
                  role="group"
                  aria-label={t.pricing.billingGroup}
                >
                  {(
                    [
                      ['monthly', t.pricing.monthly],
                      ['yearly', t.pricing.yearly],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={period === value}
                      onClick={() => setPeriod(value)}
                      className={`min-h-11 rounded-xl px-4 py-2 text-sm font-medium transition ${
                        period === value
                          ? 'bg-violet text-bg shadow-[0_8px_20px_-12px_rgba(139,108,255,0.9)]'
                          : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <label
                    htmlFor="team-size"
                    className="text-xs font-medium tracking-wide text-text-muted uppercase"
                  >
                    {t.pricing.teamSize}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="team-size-number"
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => onInputChange(e.target.value)}
                      onBlur={onInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                      className="field min-h-10 w-16 px-2 py-1.5 text-center font-mono text-sm"
                      aria-label={t.pricing.seatsInput}
                    />
                    <span className="text-xs text-text-muted">{t.pricing.seatsUnit}</span>
                  </div>
                </div>
                <input
                  id="team-size"
                  type="range"
                  min={TEAM_SIZE_MIN}
                  max={TEAM_SIZE_MAX}
                  value={users}
                  onChange={(e) => applySeats(Number(e.target.value))}
                  className="w-full"
                  aria-valuemin={TEAM_SIZE_MIN}
                  aria-valuemax={TEAM_SIZE_MAX}
                  aria-valuenow={users}
                  aria-label={t.pricing.seatsSlider}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] text-text-muted">
                  <span>{TEAM_SIZE_MIN}</span>
                  <span>{TEAM_SIZE_MAX}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-violet/25 bg-gradient-to-b from-violet/14 to-bg/50 p-6">
              <p className="font-mono text-[11px] tracking-[0.16em] text-violet-bright uppercase">
                AXIOM ·{' '}
                {period === 'monthly' ? t.pricing.periodMonthly : t.pricing.periodYearly}
              </p>
              <p className="mt-3 font-mono text-sm text-text-secondary">
                {formatMoney(pricing.rate, locale)}
                <span className="text-text-muted"> {t.pricing.perUserMonth}</span>
              </p>

              {period === 'monthly' ? (
                <>
                  <p className="mt-5 section-title text-3xl text-text sm:text-4xl">
                    {formatMoney(pricing.monthlyTotal, locale)}
                    <span className="text-base font-medium text-text-muted">
                      {' '}
                      {t.pricing.perMonth}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {fillTemplate(t.pricing.billedMonthly, {
                      seats: users,
                      rate: formatMoney(pricing.monthlyRate, locale),
                    })}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-5 section-title text-3xl text-text sm:text-4xl">
                    {formatMoney(pricing.monthlyEquivalent, locale)}
                    <span className="text-base font-medium text-text-muted">
                      {' '}
                      {t.pricing.perMonth}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">{t.pricing.monthlyEquivalent}</p>
                  <div className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-text-secondary">{t.pricing.annualInvoice}</span>
                      <span className="font-medium text-text">
                        {formatMoney(pricing.annualInvoice, locale)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-text-secondary">{t.pricing.annualSavings}</span>
                      <span className="font-medium text-violet-bright">
                        {formatMoney(pricing.annualSavings, locale)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button
                ref={chooseRef}
                type="button"
                className="btn-primary mt-7 min-h-12 w-full rounded-2xl py-2.5 text-sm font-semibold"
                onClick={() => setDialogOpen(true)}
              >
                {t.pricing.choosePlan}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="flex flex-col rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-7">
            <h3 className="section-title text-lg text-text">{t.pricing.starterName}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
              {t.pricing.starterBlurb}
            </p>
            <p className="mt-5 font-mono text-2xl font-semibold text-text">
              {t.pricing.starterPrice}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {t.pricing.starterFeatures.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-ghost mt-7 min-h-12 rounded-2xl px-4 py-2.5 text-sm font-semibold"
              onClick={() =>
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t.pricing.starterCta}
            </button>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-violet/40 bg-violet/10 p-6 shadow-[var(--shadow-glow)] sm:p-7">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet/30 blur-3xl"
              aria-hidden
            />
            <h3 className="relative section-title text-lg text-text">{t.pricing.proName}</h3>
            <p className="relative mt-2.5 text-sm leading-relaxed text-text-secondary">
              {t.pricing.proBlurb}
            </p>
            <p className="relative mt-5 font-mono text-2xl font-semibold text-text">
              {formatMoney(pricing.rate, locale)}
              <span className="text-sm font-medium text-text-muted">
                {' '}
                {t.pricing.perUserMonth}
              </span>
            </p>
            <ul className="relative mt-5 flex-1 space-y-2.5">
              {t.pricing.proFeatures.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-bright" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary relative mt-7 min-h-12 rounded-2xl px-4 py-2.5 text-sm font-semibold"
              onClick={() => setDialogOpen(true)}
            >
              {t.pricing.choosePlan}
            </button>
          </article>
        </div>
      </div>

      <PlanDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        seats={users}
        period={period}
        monthlyTotal={pricing.monthlyTotal}
        monthlyEquivalent={pricing.monthlyEquivalent}
        annualInvoice={pricing.annualInvoice}
        rate={pricing.rate}
      />
    </section>
  )
}
