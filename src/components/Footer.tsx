import { useLanguage } from '../i18n/LanguageProvider'

export function Footer() {
  const { t } = useLanguage()

  const links = [
    { href: '#features', label: t.nav.features },
    { href: '#demo', label: t.nav.demo },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#faq', label: t.nav.faq },
  ]

  return (
    <footer className="relative border-t border-white/[0.06] py-14 sm:py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="brand-mark text-xl tracking-tight text-text">AXIOM</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            {t.footer.description}
          </p>
        </div>
        <nav aria-label={t.nav.footer}>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition hover:text-violet-bright"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
