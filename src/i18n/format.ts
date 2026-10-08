import type { Locale } from './types'
import { localeToBcp47 } from './index'

export function formatMoney(amount: number, locale: Locale): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0
  return new Intl.NumberFormat(localeToBcp47[locale], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeToBcp47[locale]).format(value)
}

export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
