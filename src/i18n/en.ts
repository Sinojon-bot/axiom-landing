import type { Dictionary } from './types'

export const en: Dictionary = {
  meta: {
    title: 'AXIOM — AI helper for writing code',
    description:
      'AXIOM helps developers: you describe the idea, you get clear code. This page is a product demo.',
  },
  languages: {
    tg: 'Тоҷикӣ',
    ru: 'Русский',
    en: 'English',
  },
  languageSelector: 'Language',
  nav: {
    features: 'Features',
    demo: 'Demo',
    pricing: 'Pricing',
    faq: 'FAQ',
    tryDemo: 'Try the demo',
    primary: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mobileMenu: 'Mobile menu',
    footer: 'Footer',
  },
  hero: {
    eyebrow: 'AI HELPER FOR CODE',
    headline: 'Write the idea. Get the code.',
    description:
      'Write one sentence — AXIOM shows ready code. Built for developers.',
    forWho: 'Built for developers.',
    primaryCta: 'Open the demo',
    secondaryCta: 'Features',
    tagline: '> simple · clear · no account',
    connector: 'Idea → code',
  },
  howItWorks: {
    eyebrow: 'HOW IT WORKS',
    heading: 'Just 3 steps',
    steps: [
      {
        title: 'Pick a task',
        text: 'Form, bug fix, or tests — tap one.',
      },
      {
        title: 'Press Run',
        text: 'Code types itself. This is a demo, not a live AI.',
      },
      {
        title: 'See the result',
        text: 'Read it, copy it, or run again.',
      },
    ],
  },
  demo: {
    interactiveLabel: 'DEMO · not a real AI',
    heading: 'Try it here',
    help: '① Pick a task → ② Run → ③ code appears.',
    ideaPrompt: 'What do you want?',
    toGeneratedCode: '→ code appears',
    outputTitle: 'AXIOM reply',
    outputIdle: 'Press Run — code will appear here and below.',
    outputWorking: 'Writing code right now…',
    outputReady: 'Code ready! Look below.',
    writingTo: 'File:',
    files: 'Files',
    aiActivity: 'What AXIOM is doing',
    run: 'Run',
    replay: 'Again',
    copyCode: 'Copy',
    copied: 'Copied ✓',
    copyFailed: 'Copy failed',
    beforeAfter: 'Before / after',
    afterOnly: 'After only',
    inProgress: 'Working…',
    patchReady: 'Ready!',
    scanning: '// Reading files…',
    drafting: '// Preparing code…',
    idleHint1: '// Press the Run button.',
    idleHint2: '// Code will appear here.',
    status: ['Reading', 'Writing', 'Ready'],
    examples: {
      login: {
        label: 'Login form',
        prompt: 'Build a login form with email checks.',
        explanation: 'AXIOM builds a simple, clear login form.',
      },
      async: {
        label: 'Fix a bug',
        prompt: 'Fix the bug when switching profiles too fast.',
        explanation: 'AXIOM finds the bug and shows the correct fix.',
      },
      tests: {
        label: 'Tests',
        prompt: 'Write small tests for price formatting.',
        explanation: 'AXIOM writes simple tests so you can check the code.',
      },
    },
    live: {
      title: 'Real AI (optional)',
      hint: 'No key = simulation. Free Groq key = real answers. The key stays only in your browser.',
      modeSim: 'Simulation',
      modeLive: 'Live AI',
      apiKey: 'API key',
      apiKeyPlaceholder: 'gsk_... (from Groq)',
      baseUrl: 'API URL',
      model: 'Model',
      save: 'Save',
      saved: 'Saved',
      getKey: 'Free key: console.groq.com',
      customPrompt: 'Your request',
      customPromptPlaceholder: 'Example: write a TypeScript function that adds two numbers…',
      error: 'Error',
      needKey: 'Paste an API key first and press Save.',
      liveBadge: 'Live AI on',
    },
  },
  features: {
    eyebrow: 'FEATURES',
    heading: 'What AXIOM can do',
    description: 'Each tab shows one ability. Click and look at the example.',
    benefitLabel: 'Why it helps',
    tabsLabel: 'Features',
    items: {
      context: {
        tabLabel: 'Understands your project',
        heading: 'Looks at your project first',
        description:
          'Before writing, it checks nearby files so the code matches your style.',
        benefit: 'Less random boilerplate — more like your team’s work.',
        panelTitle: 'Which files it checks',
      },
      refactor: {
        tabLabel: 'Cleans up code',
        heading: 'Makes code tidier',
        description:
          'Pulls out repeated parts and tracks where they are used.',
        benefit: 'Changes are easier to review and accept.',
        panelTitle: 'Cleanup example',
      },
      bugs: {
        tabLabel: 'Finds bugs',
        heading: 'Spots problems earlier',
        description:
          'Marks risky places and suggests a fix.',
        benefit: 'Easier to catch issues before you ship.',
        panelTitle: 'Bug and fix',
      },
      tests: {
        tabLabel: 'Writes tests',
        heading: 'Adds useful checks',
        description:
          'Tests more than the happy path — including tricky and error cases.',
        benefit: 'You know how the code should behave.',
        panelTitle: 'Test example',
      },
    },
  },
  pricing: {
    eyebrow: 'PRICING',
    heading: 'Calculate the price yourself',
    description:
      'Choose how many people and see monthly or yearly cost. No payment on this page.',
    calculatorTitle: 'Calculator',
    calculatorHint: 'Use the toggle and slider — the price updates right away.',
    billing: 'Billing',
    billingGroup: 'Monthly or yearly',
    monthly: 'Monthly',
    yearly: 'Yearly (cheaper)',
    teamSize: 'How many people?',
    seatsInput: 'Number of people',
    seatsSlider: 'People slider',
    seatsUnit: 'people',
    perUserMonth: '/ person / month',
    perMonth: '/ month',
    billedMonthly: '{seats} × {rate} every month',
    monthlyEquivalent: 'Monthly amount if you pay yearly',
    annualInvoice: 'Total for the year',
    annualSavings: 'How much you save',
    choosePlan: 'Choose this plan',
    starterName: 'Free',
    starterBlurb: 'Look around and learn — no payment, no account.',
    starterPrice: '$0',
    starterFeatures: [
      'Interactive demo',
      'Learn with 1 seat',
      'No account needed here',
    ],
    starterCta: 'Open the demo',
    proName: 'AXIOM',
    proBlurb: 'For teams that write code every day.',
    proFeatures: [
      'Help writing code',
      'Fixes and tests',
      'Estimate 1–50 people',
    ],
    periodMonthly: 'monthly',
    periodYearly: 'yearly',
  },
  dialog: {
    title: 'Your choice',
    previewNote:
      'This is only a preview. No payment is taken and no account is created.',
    seats: 'People',
    billing: 'Billing',
    price: 'Price',
    monthlyTotal: '{amount} per month',
    yearlyEquivalent: '{amount} per month (yearly rate)',
    yearlyInvoice: '{amount} per year',
    copySummary: 'Copy summary',
    copied: 'Copied ✓',
    copyFailed: 'Could not copy',
    back: 'Back',
    close: 'Close',
    summaryTitle: 'AXIOM plan summary',
  },
  faq: {
    eyebrow: 'FAQ',
    heading: 'Common questions',
    description: 'If something is unclear, the answers are here.',
    items: [
      {
        id: 'what',
        question: 'What is AXIOM?',
        answer:
          'An AI helper for developers. You say what you need — it suggests readable code. This website is a demo.',
      },
      {
        id: 'languages',
        question: 'Which programming languages?',
        answer:
          'This demo uses TypeScript and JavaScript examples. A future product might support more — we are not promising that here.',
      },
      {
        id: 'demo',
        question: 'Is a real AI running here?',
        answer:
          'No. This is a local demo with ready-made examples. It does not call an external AI or ask for an API key.',
      },
      {
        id: 'billing',
        question: 'What does yearly billing mean?',
        answer:
          'Yearly billing is $19.20 per person per month (instead of $24 monthly). The calculator shows totals and savings. Prices are in USD for illustration only.',
      },
      {
        id: 'team-size',
        question: 'Can I change the number of people?',
        answer:
          'In the calculator you can try 1 to 50 people. Real team management is not built on this page — it is only an estimate.',
      },
      {
        id: 'control',
        question: 'Who decides which code to keep?',
        answer:
          'You do. Look first, then decide. In this demo nothing is written to your real repository.',
      },
    ],
  },
  finalCta: {
    heading: 'Ready to look?',
    description: 'Open the demo — no account, no payment. One button is enough.',
    button: 'Open the demo',
  },
  footer: {
    description: 'AI helper for writing code.',
  },
}
