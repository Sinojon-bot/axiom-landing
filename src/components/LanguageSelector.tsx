import { LOCALES, type Locale } from '../i18n'
import { useLanguage } from '../i18n/LanguageProvider'

type Props = {
  id?: string
  className?: string
}

export function LanguageSelector({ id = 'language-select', className = '' }: Props) {
  const { locale, setLocale, t } = useLanguage()

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">{t.languageSelector}</span>
      <select
        id={id}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="field min-h-9 min-w-[6.75rem] cursor-pointer rounded-xl border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-text-secondary hover:text-text"
        aria-label={t.languageSelector}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t.languages[code]}
          </option>
        ))}
      </select>
    </label>
  )
}
