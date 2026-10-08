import type { Dictionary, Locale } from './types'
import { en } from './en'
import { ru } from './ru'
import { tg } from './tg'

export type { Dictionary, Locale } from './types'

export const LOCALES: Locale[] = ['tg', 'ru', 'en']

export const dictionaries: Record<Locale, Dictionary> = { tg, ru, en }

export const STORAGE_KEY = 'axiom-locale'

export const localeToBcp47: Record<Locale, string> = {
  tg: 'tg',
  ru: 'ru-RU',
  en: 'en-US',
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'tg' || value === 'ru' || value === 'en'
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
