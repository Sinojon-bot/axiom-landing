export type BillingPeriod = 'monthly' | 'yearly'

export const TEAM_SIZE_MIN = 1
export const TEAM_SIZE_MAX = 50

/** Single source of truth for seat pricing (USD). */
export const RATES = {
  monthly: 24,
  yearly: 19.2,
} as const

const cents = (n: number) => Math.round(n * 100) / 100

export function calcPricing(period: BillingPeriod, seats: number) {
  const safeSeats = Math.min(
    TEAM_SIZE_MAX,
    Math.max(TEAM_SIZE_MIN, Math.round(seats) || TEAM_SIZE_MIN),
  )
  const monthlyRate = RATES.monthly
  const yearlyRate = RATES.yearly

  const monthlyTotal = cents(monthlyRate * safeSeats)
  const monthlyEquivalent = cents(yearlyRate * safeSeats)
  const annualInvoice = cents(yearlyRate * safeSeats * 12)
  const annualSavings = cents((monthlyRate - yearlyRate) * safeSeats * 12)

  return {
    seats: safeSeats,
    monthlyRate,
    yearlyRate,
    rate: period === 'monthly' ? monthlyRate : yearlyRate,
    monthlyTotal,
    monthlyEquivalent,
    annualInvoice,
    annualSavings,
    displayTotal: period === 'monthly' ? monthlyTotal : monthlyEquivalent,
  }
}
