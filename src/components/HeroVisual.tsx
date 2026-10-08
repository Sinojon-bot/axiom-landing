import { useEffect, useMemo, useState } from 'react'
import { demoExamples, type CodeToken } from '../data/demo'
import { CodeBlock } from './CodeBlock'
import { useReducedMotion } from '../hooks/useReducedMotion'

const MAX_LINES = 16

function buildStream(): { file: string; line: CodeToken[] }[] {
  const out: { file: string; line: CodeToken[] }[] = []
  for (const ex of demoExamples) {
    for (const row of ex.afterLines) {
      out.push({
        file: ex.activeFile,
        line: row.length ? row : [{ text: ' ', kind: 'plain' }],
      })
    }
  }
  // loop material without a “restart” feel
  return out.length ? [...out, ...out] : [{ file: 'main.ts', line: [{ text: ' ', kind: 'plain' }] }]
}

function lineLen(tokens: CodeToken[]) {
  return tokens.reduce((n, t) => n + t.text.length, 0)
}

function sliceTokens(tokens: CodeToken[], chars: number): CodeToken[] {
  let left = chars
  const out: CodeToken[] = []
  for (const tok of tokens) {
    if (left <= 0) break
    if (tok.text.length <= left) {
      out.push(tok)
      left -= tok.text.length
    } else {
      out.push({ ...tok, text: tok.text.slice(0, left) })
      left = 0
    }
  }
  return out.length ? out : [{ text: '', kind: 'plain' }]
}

type Tick = {
  /** oldest visible line index in stream */
  head: number
  /** completed lines currently on screen */
  full: number
  /** chars on the line being typed at the bottom */
  partial: number
  /** gutter number for the top visible line — climbs as lines scroll away */
  startLine: number
}

/**
 * Fills top → bottom. When full, line 1 vanishes and writing continues
 * at the bottom — never clears and restarts from the top.
 */
export function HeroVisual() {
  const reduced = useReducedMotion()
  const stream = useMemo(() => buildStream(), [])
  const [tick, setTick] = useState<Tick>({ head: 0, full: 0, partial: 0, startLine: 1 })

  useEffect(() => {
    if (reduced || !stream.length) {
      setTick({
        head: 0,
        full: Math.min(MAX_LINES, stream.length),
        partial: 0,
        startLine: 1,
      })
      return
    }

    setTick({ head: 0, full: 0, partial: 0, startLine: 1 })

    const id = window.setInterval(() => {
      setTick((prev) => {
        const writingIdx = (prev.head + prev.full) % stream.length
        const writing = stream[writingIdx]
        const len = Math.max(1, lineLen(writing.line))

        if (prev.partial + 1 < len) {
          return { ...prev, partial: prev.partial + 1 }
        }

        // line done
        if (prev.full + 1 < MAX_LINES) {
          return { ...prev, full: prev.full + 1, partial: 0 }
        }

        // screen full → drop first line + its number scrolls up with it
        return {
          head: (prev.head + 1) % stream.length,
          full: MAX_LINES - 1,
          partial: 0,
          startLine: prev.startLine + 1,
        }
      })
    }, 28)

    return () => window.clearInterval(id)
  }, [reduced, stream])

  const file =
    stream[(tick.head + tick.full) % Math.max(stream.length, 1)]?.file ?? 'useProfile.ts'

  const visibleLines = useMemo(() => {
    if (!stream.length) return []
    const lines: CodeToken[][] = []

    if (reduced) {
      for (let i = 0; i < Math.min(MAX_LINES, stream.length); i++) {
        lines.push(stream[i].line)
      }
      return lines
    }

    for (let i = 0; i < tick.full; i++) {
      lines.push(stream[(tick.head + i) % stream.length].line)
    }

    const writing = stream[(tick.head + tick.full) % stream.length]
    lines.push(sliceTokens(writing.line, tick.partial))
    return lines
  }, [stream, tick, reduced])

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2.5rem] opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(139,108,255,0.32), rgba(90,63,212,0.1) 55%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="glass-terminal relative overflow-hidden rounded-[1.75rem]">
        <div className="relative flex items-center gap-2 border-b border-white/[0.08] px-4 py-3.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f0c14b]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#86efac]/70" />
          </span>
          <span className="ml-1.5 truncate font-mono text-[11px] tracking-[0.14em] text-white/50">
            {file}
          </span>
          <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-violet-bright/60">
            WRITE
          </span>
        </div>

        {/* top → bottom fill, no empty gap at top */}
        <div className="relative min-h-[360px] bg-[#1e1e1e] px-3 py-3 sm:min-h-[440px] sm:px-4 sm:py-4">
          <CodeBlock
            lines={visibleLines}
            startLineNumber={tick.startLine}
            className="!text-[12.5px] leading-[1.55]"
          />
          {!reduced && (
            <span
              className="cursor-blink ml-[2.55rem] inline-block h-3.5 w-[7px] translate-y-[-2px] bg-[#aeafad]"
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>
  )
}
