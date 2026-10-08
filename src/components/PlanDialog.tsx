import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { BillingPeriod } from '../data/pricing'
import { useLanguage } from '../i18n/LanguageProvider'
import { fillTemplate, formatMoney } from '../i18n/format'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  open: boolean
  onClose: () => void
  seats: number
  period: BillingPeriod
  monthlyTotal: number
  monthlyEquivalent: number
  annualInvoice: number
  rate: number
}

export function PlanDialog({
  open,
  onClose,
  seats,
  period,
  monthlyTotal,
  monthlyEquivalent,
  annualInvoice,
  rate,
}: Props) {
  const { t, locale } = useLanguage()
  const reducedMotion = useReducedMotion()
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle')
  const copyTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus())
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  if (!open) return null

  const billingLabel =
    period === 'monthly' ? t.pricing.periodMonthly : t.pricing.periodYearly

  const priceLines =
    period === 'monthly'
      ? [fillTemplate(t.dialog.monthlyTotal, { amount: formatMoney(monthlyTotal, locale) })]
      : [
          fillTemplate(t.dialog.yearlyEquivalent, {
            amount: formatMoney(monthlyEquivalent, locale),
          }),
          fillTemplate(t.dialog.yearlyInvoice, {
            amount: formatMoney(annualInvoice, locale),
          }),
        ]

  const buildSummary = () =>
    [
      t.dialog.summaryTitle,
      `${t.dialog.seats}: ${seats}`,
      `${t.dialog.billing}: ${billingLabel}`,
      `${t.pricing.perUserMonth.replace(/^\//, '').trim()}: ${formatMoney(rate, locale)}`,
      ...priceLines,
      t.dialog.previewNote,
    ].join('\n')

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary())
      setCopyState('ok')
    } catch {
      setCopyState('fail')
    }
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
        aria-label={t.dialog.close}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`relative z-10 w-full max-w-md rounded-[1.5rem] glass-panel neon-ring p-5 sm:p-6 ${
          reducedMotion ? '' : 'fade-in'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="section-title text-lg text-text">
            {t.dialog.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 text-text-secondary transition hover:border-violet-bright/30 hover:text-text"
            aria-label={t.dialog.close}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p id={descId} className="text-sm leading-relaxed text-text-secondary">
          {t.dialog.previewNote}
        </p>

        <dl className="mt-5 space-y-3 rounded-2xl border border-white/[0.08] bg-bg/40 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">{t.dialog.seats}</dt>
            <dd className="font-medium text-text">{seats}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">{t.dialog.billing}</dt>
            <dd className="font-medium capitalize text-text">{billingLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">{t.dialog.price}</dt>
            <dd className="text-right font-medium text-text">
              {period === 'monthly' ? (
                formatMoney(monthlyTotal, locale)
              ) : (
                <span className="block space-y-1">
                  <span className="block">
                    {formatMoney(monthlyEquivalent, locale)}
                    {t.pricing.perMonth}
                  </span>
                  <span className="block text-xs font-normal text-text-secondary">
                    {formatMoney(annualInvoice, locale)} · {t.pricing.annualInvoice}
                  </span>
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={copySummary}
            className="btn-primary min-h-11 flex-1 rounded-2xl px-4 py-2.5 text-sm"
          >
            {copyState === 'ok'
              ? t.dialog.copied
              : copyState === 'fail'
                ? t.dialog.copyFailed
                : t.dialog.copySummary}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost min-h-11 flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold"
          >
            {t.dialog.back}
          </button>
        </div>
      </div>
    </div>
  )
}
