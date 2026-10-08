import type { DemoExampleId } from '../data/demo'
import type { FeatureId } from '../data/features'

export type Locale = 'tg' | 'ru' | 'en'

export type DemoCopy = {
  label: string
  prompt: string
  explanation: string
}

export type FeatureCopy = {
  tabLabel: string
  heading: string
  description: string
  benefit: string
  panelTitle: string
}

export type FaqCopy = {
  id: string
  question: string
  answer: string
}

export type Dictionary = {
  meta: {
    title: string
    description: string
  }
  languages: Record<Locale, string>
  languageSelector: string
  nav: {
    features: string
    demo: string
    pricing: string
    faq: string
    tryDemo: string
    primary: string
    openMenu: string
    closeMenu: string
    mobileMenu: string
    footer: string
  }
  hero: {
    eyebrow: string
    headline: string
    description: string
    forWho: string
    primaryCta: string
    secondaryCta: string
    tagline: string
    connector: string
  }
  howItWorks: {
    eyebrow: string
    heading: string
    steps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }]
  }
  demo: {
    interactiveLabel: string
    heading: string
    help: string
    ideaPrompt: string
    toGeneratedCode: string
    outputTitle: string
    outputIdle: string
    outputWorking: string
    outputReady: string
    writingTo: string
    files: string
    aiActivity: string
    run: string
    replay: string
    copyCode: string
    copied: string
    copyFailed: string
    beforeAfter: string
    afterOnly: string
    inProgress: string
    patchReady: string
    scanning: string
    drafting: string
    idleHint1: string
    idleHint2: string
    status: [string, string, string]
    examples: Record<DemoExampleId, DemoCopy>
    live: {
      title: string
      hint: string
      modeSim: string
      modeLive: string
      apiKey: string
      apiKeyPlaceholder: string
      baseUrl: string
      model: string
      save: string
      saved: string
      getKey: string
      customPrompt: string
      customPromptPlaceholder: string
      error: string
      needKey: string
      liveBadge: string
    }
  }
  features: {
    eyebrow: string
    heading: string
    description: string
    benefitLabel: string
    tabsLabel: string
    items: Record<FeatureId, FeatureCopy>
  }
  pricing: {
    eyebrow: string
    heading: string
    description: string
    calculatorTitle: string
    calculatorHint: string
    billing: string
    billingGroup: string
    monthly: string
    yearly: string
    teamSize: string
    seatsInput: string
    seatsSlider: string
    seatsUnit: string
    perUserMonth: string
    perMonth: string
    billedMonthly: string
    monthlyEquivalent: string
    annualInvoice: string
    annualSavings: string
    choosePlan: string
    starterName: string
    starterBlurb: string
    starterPrice: string
    starterFeatures: [string, string, string]
    starterCta: string
    proName: string
    proBlurb: string
    proFeatures: [string, string, string]
    periodMonthly: string
    periodYearly: string
  }
  dialog: {
    title: string
    previewNote: string
    seats: string
    billing: string
    price: string
    monthlyTotal: string
    yearlyEquivalent: string
    yearlyInvoice: string
    copySummary: string
    copied: string
    copyFailed: string
    back: string
    close: string
    summaryTitle: string
  }
  faq: {
    eyebrow: string
    heading: string
    description: string
    items: FaqCopy[]
  }
  finalCta: {
    heading: string
    description: string
    button: string
  }
  footer: {
    description: string
  }
}
