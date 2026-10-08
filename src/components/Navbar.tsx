import { useEffect, useId, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import { LanguageSelector } from './LanguageSelector'

type Props = {
  onTryDemo: () => void
}

export function Navbar({ onTryDemo }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuId = useId()

  const links = [
    { href: '#features', label: t.nav.features },
    { href: '#demo', label: t.nav.demo },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#faq', label: t.nav.faq },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const navigate = (href: string) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-bg/75 backdrop-blur-2xl'
          : 'border-b border-transparent bg-bg/35 backdrop-blur-md'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6"
        aria-label={t.nav.primary}
      >
        <a
          href="#top"
          className="group flex shrink-0 items-center gap-2.5 text-text"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setOpen(false)
          }}
        >
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <span className="absolute inset-0 bg-gradient-to-br from-violet/40 to-transparent opacity-80" />
            <span className="brand-mark relative text-[11px] tracking-[0.12em] text-violet-bright">
              AX
            </span>
          </span>
          <span className="brand-mark text-[1.1rem] tracking-tight">AXIOM</span>
        </a>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link rounded-lg px-3 py-2 text-[13px] font-medium xl:px-3.5"
                onClick={(e) => {
                  e.preventDefault()
                  navigate(link.href)
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector id="lang-desktop" />
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onTryDemo()
            }}
            className="btn-primary hidden min-h-10 rounded-xl px-4 py-2 text-[13px] font-semibold md:inline-flex"
          >
            {t.nav.tryDemo}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-2 text-text transition hover:border-violet-bright/30 hover:bg-white/[0.06] lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id={menuId}
          className="border-t border-white/10 bg-bg/95 backdrop-blur-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.mobileMenu}
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-xl px-3.5 py-3.5 text-base text-text-secondary transition hover:bg-white/[0.04] hover:text-text"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(link.href)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="px-1 pt-2 sm:hidden">
              <LanguageSelector id="lang-mobile" className="w-full [&_select]:w-full" />
            </li>
            <li className="pt-3">
              <button
                type="button"
                className="btn-primary min-h-12 w-full rounded-2xl px-3 py-3 text-sm font-semibold"
                onClick={() => {
                  setOpen(false)
                  onTryDemo()
                }}
              >
                {t.nav.tryDemo}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
