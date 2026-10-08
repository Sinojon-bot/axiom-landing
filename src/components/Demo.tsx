import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  Check,
  Copy,
  FileCode2,
  FolderOpen,
  Play,
  RotateCcw,
  GitCompare,
  Sparkles,
  ArrowRight,
  KeyRound,
} from 'lucide-react'
import {
  demoExamples,
  tokensToPlainText,
  type CodeToken,
  type DemoExampleId,
} from '../data/demo'
import { CodeBlock, countTokensChars } from './CodeBlock'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLanguage } from '../i18n/LanguageProvider'
import {
  generateCodeStream,
  loadAiSettings,
  saveAiSettings,
  type AiSettings,
} from '../lib/ai'

export type DemoHandle = {
  activate: () => void
  focusPrimaryControl: () => void
}

type RunPhase = 'idle' | 'reading' | 'preparing' | 'typing' | 'done' | 'error'
type DemoMode = 'sim' | 'live'

function statusIndex(phase: RunPhase): number {
  if (phase === 'reading') return 0
  if (phase === 'preparing' || phase === 'typing') return 1
  if (phase === 'done') return 2
  return -1
}

type DemoProps = {
  variant?: 'hero' | 'section'
}

export const Demo = forwardRef<DemoHandle, DemoProps>(function Demo(_props, ref) {
  const { t } = useLanguage()
  const reducedMotion = useReducedMotion()
  const [exampleId, setExampleId] = useState<DemoExampleId>('login')
  const [phase, setPhase] = useState<RunPhase>('idle')
  const [visibleChars, setVisibleChars] = useState(0)
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [viewMode, setViewMode] = useState<'diff' | 'after'>('diff')
  const [highlight, setHighlight] = useState(false)
  const [mode, setMode] = useState<DemoMode>('sim')
  const [settings, setSettings] = useState<AiSettings>(() => loadAiSettings())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [liveCode, setLiveCode] = useState('')
  const [liveError, setLiveError] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')

  const timers = useRef<number[]>([])
  const runId = useRef(0)
  const copyTimer = useRef<number | null>(null)
  const runButtonRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const example = demoExamples.find((e) => e.id === exampleId)!
  const copy = t.demo.examples[exampleId]
  const activePrompt = customPrompt.trim() || copy.prompt
  const hasKey = Boolean(settings.apiKey.trim())

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }, [])

  const stopAll = useCallback(() => {
    runId.current += 1
    clearTimers()
    abortRef.current?.abort()
    abortRef.current = null
  }, [clearTimers])

  const runSimulation = useCallback(
    (targetId?: DemoExampleId) => {
      const id = targetId ?? exampleId
      const ex = demoExamples.find((e) => e.id === id)!
      runId.current += 1
      const currentRun = runId.current
      clearTimers()
      setCopied('idle')
      setLiveError(null)
      setLiveCode('')
      setExampleId(id)
      setViewMode('diff')

      const total = countTokensChars(ex.afterLines)

      if (reducedMotion) {
        setPhase('done')
        setVisibleChars(total)
        return
      }

      setPhase('reading')
      setVisibleChars(0)

      schedule(() => {
        if (runId.current !== currentRun) return
        setPhase('preparing')
        schedule(() => {
          if (runId.current !== currentRun) return
          setPhase('typing')
          const start = performance.now()
          const duration = Math.min(2600, Math.max(1400, total * 10))

          const tick = () => {
            if (runId.current !== currentRun) return
            const elapsed = performance.now() - start
            const progress = Math.min(1, elapsed / duration)
            setVisibleChars(Math.floor(progress * total))
            if (progress < 1) {
              timers.current.push(window.setTimeout(tick, 32))
            } else {
              setVisibleChars(total)
              setPhase('done')
            }
          }
          tick()
        }, 550)
      }, 700)
    },
    [clearTimers, exampleId, reducedMotion, schedule],
  )

  const runLive = useCallback(async () => {
    if (!settings.apiKey.trim()) {
      setLiveError(t.demo.live.needKey)
      setSettingsOpen(true)
      setPhase('error')
      return
    }

    stopAll()
    const currentRun = runId.current
    const controller = new AbortController()
    abortRef.current = controller

    setCopied('idle')
    setLiveError(null)
    setLiveCode('')
    setPhase('reading')
    setVisibleChars(0)

    schedule(() => {
      if (runId.current !== currentRun) return
      setPhase('preparing')
    }, 400)

    try {
      setPhase('typing')
      await generateCodeStream({
        settings,
        userPrompt: activePrompt,
        signal: controller.signal,
        onToken: (full) => {
          if (runId.current !== currentRun) return
          setLiveCode(full)
        },
      })
      if (runId.current !== currentRun) return
      setPhase('done')
    } catch (err) {
      if (controller.signal.aborted || runId.current !== currentRun) return
      const message = err instanceof Error ? err.message : t.demo.live.error
      setLiveError(message)
      setPhase('error')
    }
  }, [activePrompt, schedule, settings, stopAll, t.demo.live.error, t.demo.live.needKey])

  const runDemo = useCallback(
    (targetId?: DemoExampleId) => {
      if (mode === 'live') {
        void runLive()
        return
      }
      runSimulation(targetId)
    },
    [mode, runLive, runSimulation],
  )

  useImperativeHandle(ref, () => ({
    activate: () => {
      setHighlight(true)
      schedule(() => setHighlight(false), 1600)
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      schedule(() => {
        runButtonRef.current?.focus({ preventScroll: true })
        runDemo(exampleId)
      }, 350)
    },
    focusPrimaryControl: () => {
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      schedule(() => runButtonRef.current?.focus({ preventScroll: true }), 400)
    },
  }))

  useEffect(
    () => () => {
      stopAll()
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    },
    [stopAll],
  )

  useEffect(() => {
    setCustomPrompt(t.demo.examples[exampleId].prompt)
  }, [exampleId, t.demo.examples])

  const selectExample = (id: DemoExampleId) => {
    stopAll()
    setExampleId(id)
    setPhase('idle')
    setVisibleChars(0)
    setCopied('idle')
    setViewMode('diff')
    setLiveCode('')
    setLiveError(null)
  }

  const copyCode = async () => {
    const text =
      mode === 'live' && liveCode
        ? liveCode
        : tokensToPlainText(example.afterLines)
    try {
      await navigator.clipboard.writeText(text)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied('idle'), 1800)
  }

  const saveSettings = () => {
    saveAiSettings(settings)
    setSettingsSaved(true)
    schedule(() => setSettingsSaved(false), 1600)
    if (settings.apiKey.trim()) setMode('live')
  }

  const activeStatus = statusIndex(phase)

  let codeLines: CodeToken[][]
  let showDiffMarkers = false
  let charsToShow: number | undefined

  if (example.id === 'async') {
    if (phase === 'idle' || phase === 'error') {
      codeLines = example.beforeLines ?? example.afterLines
      charsToShow = undefined
    } else if (phase === 'reading' || phase === 'preparing') {
      codeLines = example.afterLines
      charsToShow = 0
      showDiffMarkers = true
    } else if (phase === 'typing') {
      codeLines = example.afterLines
      charsToShow = visibleChars
      showDiffMarkers = true
    } else if (viewMode === 'diff') {
      codeLines = [...(example.beforeLines ?? []), [], ...example.afterLines]
      charsToShow = undefined
      showDiffMarkers = true
    } else {
      codeLines = example.afterLines
      charsToShow = undefined
      showDiffMarkers = true
    }
  } else if (phase === 'idle' || phase === 'error') {
    codeLines = [
      [{ text: t.demo.idleHint1, kind: 'comment' }],
      [],
      [{ text: t.demo.idleHint2, kind: 'comment' }],
    ]
    charsToShow = undefined
  } else if (phase === 'reading' || phase === 'preparing') {
    codeLines = example.afterLines
    charsToShow = 0
  } else if (phase === 'typing') {
    codeLines = example.afterLines
    charsToShow = visibleChars
  } else {
    codeLines = example.afterLines
    charsToShow = undefined
  }

  const copyLabel =
    copied === 'ok' ? t.demo.copied : copied === 'fail' ? t.demo.copyFailed : t.demo.copyCode

  const showLiveEditor = mode === 'live'

  return (
    <div id="demo" className="relative scroll-mt-24" aria-labelledby="demo-heading">
      <div className="mb-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker mb-4">
              {mode === 'live' && hasKey ? t.demo.live.liveBadge : t.demo.interactiveLabel}
            </p>
            <h2
              id="demo-heading"
              className="section-title text-[2rem] sm:text-4xl lg:text-[2.75rem]"
            >
              {t.demo.heading}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {t.demo.help}
            </p>
          </div>
        </div>
      </div>

      {/* Live AI settings */}
      <div className="mb-4 overflow-hidden rounded-2xl glass-panel">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-expanded={settingsOpen}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-text">
            <KeyRound className="h-4 w-4 text-violet-bright" aria-hidden />
            {t.demo.live.title}
          </span>
          <span className="text-xs text-text-muted">{settingsOpen ? '−' : '+'}</span>
        </button>
        {settingsOpen && (
          <div className="space-y-3 border-t border-border-subtle px-4 py-4">
            <p className="text-sm text-text-secondary">{t.demo.live.hint}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`min-h-10 rounded-xl px-3 py-2 text-sm font-medium ${
                  mode === 'sim'
                    ? 'bg-violet/20 text-text ring-1 ring-violet/40'
                    : 'bg-surface-2 text-text-secondary'
                }`}
                onClick={() => {
                  stopAll()
                  setMode('sim')
                  setPhase('idle')
                  setLiveCode('')
                  setLiveError(null)
                }}
              >
                {t.demo.live.modeSim}
              </button>
              <button
                type="button"
                className={`min-h-10 rounded-xl px-3 py-2 text-sm font-medium ${
                  mode === 'live'
                    ? 'bg-mint/15 text-text ring-1 ring-mint/40'
                    : 'bg-surface-2 text-text-secondary'
                }`}
                onClick={() => {
                  stopAll()
                  setMode('live')
                  setPhase('idle')
                  setVisibleChars(0)
                  setLiveCode('')
                  setLiveError(null)
                }}
              >
                {t.demo.live.modeLive}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-text-muted sm:col-span-2">
                {t.demo.live.apiKey}
                <input
                  type="password"
                  autoComplete="off"
                  value={settings.apiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder={t.demo.live.apiKeyPlaceholder}
                  className="field mt-1.5 w-full px-3 py-2.5 font-mono text-sm"
                />
              </label>
              <label className="block text-xs text-text-muted">
                {t.demo.live.baseUrl}
                <input
                  type="url"
                  value={settings.baseUrl}
                  onChange={(e) => setSettings((s) => ({ ...s, baseUrl: e.target.value }))}
                  className="field mt-1.5 w-full px-3 py-2.5 font-mono text-xs"
                />
              </label>
              <label className="block text-xs text-text-muted">
                {t.demo.live.model}
                <input
                  type="text"
                  value={settings.model}
                  onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
                  className="field mt-1.5 w-full px-3 py-2.5 font-mono text-xs"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveSettings}
                className="btn-primary min-h-10 rounded-xl px-4 text-sm font-semibold"
              >
                {settingsSaved ? t.demo.live.saved : t.demo.live.save}
              </button>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-violet-bright underline-offset-2 hover:underline"
              >
                {t.demo.live.getKey}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="relative mb-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="flex min-w-0 flex-col gap-2 rounded-[1.35rem] border border-violet/30 bg-violet/10 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet/30 bg-bg/40">
              <FileCode2 className="h-5 w-5 text-violet-bright" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-violet-bright uppercase">
                {mode === 'live' ? t.demo.live.customPrompt : t.demo.ideaPrompt}
              </p>
              {mode === 'live' ? (
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder={t.demo.live.customPromptPlaceholder}
                  className="field mt-2.5 w-full resize-y px-3 py-2.5 text-sm"
                />
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-text sm:text-base">{copy.prompt}</p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex" aria-hidden>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] neon-ring">
            <ArrowRight className="h-4 w-4 text-violet-bright" />
          </div>
        </div>
        <div className="h-px w-full connector-line md:hidden" aria-hidden />

        <div className="flex min-w-0 items-start gap-3 rounded-[1.35rem] border border-violet-bright/20 bg-white/[0.03] p-5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-bright/20 bg-bg/40">
            <Sparkles className="h-5 w-5 text-violet-bright" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-violet-bright uppercase">
              {t.demo.outputTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text sm:text-base">
              {phase === 'error'
                ? liveError || t.demo.live.error
                : phase === 'idle'
                  ? t.demo.outputIdle
                  : phase === 'done'
                    ? t.demo.outputReady
                    : t.demo.outputWorking}
            </p>
            <p className="mt-2.5 font-mono text-[11px] text-text-secondary">
              {t.demo.writingTo}{' '}
              <span className="text-violet-bright">{example.activeFile}</span>
            </p>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-[1.75rem] glass-panel transition-[box-shadow,border-color] ${
          highlight ? 'neon-ring' : ''
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-border-subtle p-3 sm:p-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.demo.heading}>
            {demoExamples.map((ex) => (
              <button
                key={ex.id}
                type="button"
                role="tab"
                aria-selected={exampleId === ex.id}
                className={`min-h-10 rounded-xl px-3.5 py-1.5 text-sm transition ${
                  exampleId === ex.id
                    ? 'bg-violet/20 text-text ring-1 ring-violet/40'
                    : 'bg-white/[0.03] text-text-secondary hover:bg-white/[0.05] hover:text-text'
                }`}
                onClick={() => selectExample(ex.id)}
              >
                {t.demo.examples[ex.id].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode === 'sim' && example.id === 'async' && phase === 'done' && (
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'diff' ? 'after' : 'diff'))}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text"
              >
                <GitCompare className="h-3.5 w-3.5" aria-hidden />
                {viewMode === 'diff' ? t.demo.afterOnly : t.demo.beforeAfter}
              </button>
            )}
            <button
              ref={runButtonRef}
              type="button"
              onClick={() => runDemo()}
              className="btn-primary inline-flex min-h-10 items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-semibold"
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              {t.demo.run}
            </button>
            <button
              type="button"
              onClick={() => {
                stopAll()
                setPhase('idle')
                setVisibleChars(0)
                setLiveCode('')
                setLiveError(null)
                schedule(() => runDemo(), 50)
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text disabled:opacity-40"
              disabled={phase === 'idle'}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {t.demo.replay}
            </button>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text"
            >
              {copied === 'ok' ? (
                <Check className="h-3.5 w-3.5 text-mint" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              {copyLabel}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_210px]">
          <div className="min-w-0 border-b border-border-subtle md:border-b-0 md:border-r">
            <div className="flex gap-1 overflow-x-auto border-b border-border-subtle px-2 py-2">
              <span className="mr-1 flex items-center text-text-muted">
                <FolderOpen className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">{t.demo.files}</span>
              </span>
              {example.files.map((file) => {
                const name = file.split('/').pop()!
                const active = name === example.activeFile
                return (
                  <span
                    key={file}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 font-mono text-[11px] ${
                      active ? 'bg-violet/20 text-text ring-1 ring-violet/30' : 'text-text-muted'
                    }`}
                    title={file}
                  >
                    {name}
                  </span>
                )
              })}
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-border-subtle bg-surface-2/50 px-2 pt-2">
              {example.tabs.map((tab) => (
                <div
                  key={tab}
                  className={`rounded-t-md px-3 py-2 font-mono text-[11px] ${
                    tab === example.activeFile
                      ? 'border border-b-0 border-border-subtle bg-surface text-text'
                      : 'text-text-muted'
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>
            <div className="max-h-[420px] min-h-[300px] overflow-auto bg-[#080512]/95 p-3.5 sm:min-h-[340px]">
              {showLiveEditor ? (
                <pre className="glass-ink whitespace-pre-wrap break-words font-mono text-[12px] leading-5 sm:text-[13px]">
                  {liveCode ||
                    (phase === 'idle'
                      ? `// ${t.demo.idleHint1.replace(/^\/\/\s*/, '')}\n// ${t.demo.idleHint2.replace(/^\/\/\s*/, '')}`
                      : phase === 'error'
                        ? `// ${liveError ?? t.demo.live.error}`
                        : '// …')}
                  {(phase === 'typing' || phase === 'preparing' || phase === 'reading') && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-violet-bright pulse-glow" />
                  )}
                </pre>
              ) : (
                <>
                  {(phase === 'reading' || phase === 'preparing') && (
                    <p className="mb-3 font-mono text-xs text-mint fade-in">
                      {phase === 'reading' ? t.demo.scanning : t.demo.drafting}
                    </p>
                  )}
                  {phase === 'typing' && (
                    <p className="mb-2 font-mono text-[10px] text-text-muted">
                      {t.demo.outputWorking}
                    </p>
                  )}
                  <CodeBlock
                    lines={codeLines}
                    maxVisibleChars={charsToShow}
                    showDiffMarkers={showDiffMarkers}
                  />
                </>
              )}
            </div>
            <p className="border-t border-border-subtle px-3 py-2.5 text-sm text-text-secondary">
              {mode === 'live' ? t.demo.live.hint : copy.explanation}
            </p>
          </div>

          <aside className="bg-surface-2/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t.demo.aiActivity}
            </p>
            <ol className="space-y-3">
              {t.demo.status.map((step, i) => {
                const state =
                  activeStatus < 0
                    ? 'pending'
                    : i < activeStatus
                      ? 'done'
                      : i === activeStatus
                        ? 'active'
                        : 'pending'
                const done = state === 'done' || (phase === 'done' && i <= 2)
                return (
                  <li key={step} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        done
                          ? 'border-mint/40 bg-mint/15 text-mint'
                          : state === 'active'
                            ? 'border-violet/50 bg-violet/15 text-violet-bright pulse-glow'
                            : 'border-border text-text-muted'
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          state === 'pending' && !done ? 'text-text-muted' : 'text-text'
                        }`}
                      >
                        {step}
                      </p>
                      {state === 'active' && phase !== 'done' && (
                        <p className="mt-0.5 text-xs text-text-secondary">{t.demo.inProgress}</p>
                      )}
                      {phase === 'done' && i === 2 && (
                        <p className="mt-0.5 text-xs text-mint">{t.demo.patchReady}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  )
})
