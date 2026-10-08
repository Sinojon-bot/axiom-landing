import type { ReactNode } from 'react'
import type { CodeToken } from '../data/demo'

/** VS Code Dark+–style ink */
const kindClass: Record<CodeToken['kind'], string> = {
  plain: 'text-[#d4d4d4]',
  keyword: 'text-[#c586c0]',
  string: 'text-[#ce9178]',
  comment: 'text-[#6a9955] italic',
  function: 'text-[#dcdcaa]',
  type: 'text-[#4ec9b0]',
  number: 'text-[#b5cea8]',
  operator: 'text-[#d4d4d4]',
  'diff-add': 'text-[#b5cea8]',
  'diff-remove': 'text-[#f14c4c]',
}

type Props = {
  lines: CodeToken[][]
  maxVisibleChars?: number
  className?: string
  showDiffMarkers?: boolean
  /** First gutter number (scrolls with content when lines lift off the top). */
  startLineNumber?: number
}

export function CodeBlock({
  lines,
  maxVisibleChars,
  className = '',
  showDiffMarkers = false,
  startLineNumber = 1,
}: Props) {
  let remaining =
    typeof maxVisibleChars === 'number' ? maxVisibleChars : Number.POSITIVE_INFINITY

  return (
    <pre
      className={`overflow-x-auto font-mono text-[12px] leading-5 sm:text-[13px] ${className}`}
      aria-hidden={maxVisibleChars !== undefined}
    >
      <code>
        {lines.map((line, lineIndex) => {
          if (remaining <= 0) return null

          const isAdd = line.some((tok) => tok.kind === 'diff-add')
          const isRem = line.some((tok) => tok.kind === 'diff-remove')
          const rowBg = isAdd
            ? 'bg-mint/5'
            : isRem
              ? 'bg-danger/5'
              : ''

          const rendered: ReactNode[] = []
          for (let i = 0; i < line.length; i++) {
            const tok = line[i]
            if (remaining <= 0) break
            const slice =
              tok.text.length <= remaining ? tok.text : tok.text.slice(0, remaining)
            remaining -= slice.length
            rendered.push(
              <span key={i} className={kindClass[tok.kind]}>
                {slice}
              </span>,
            )
          }

          const lineLen = line.reduce((n, tok) => n + tok.text.length, 0)
          const showCursor =
            typeof maxVisibleChars === 'number' &&
            remaining === 0 &&
            lineLen > 0 &&
            rendered.length > 0

          return (
            <div
              key={lineIndex}
              className={`flex min-h-5 ${rowBg}`}
            >
              {showDiffMarkers && (
                <span
                  className={`w-4 shrink-0 select-none text-center ${
                    isAdd ? 'text-mint' : isRem ? 'text-danger' : 'text-text-muted'
                  }`}
                >
                  {isAdd ? '+' : isRem ? '−' : ' '}
                </span>
              )}
              <span className="w-8 shrink-0 select-none pr-3 text-right text-[#858585]">
                {startLineNumber + lineIndex}
              </span>
              <span className="whitespace-pre">
                {rendered}
                {showCursor && (
                  <span className="ml-px inline-block h-3.5 w-[2px] translate-y-[2px] bg-violet-bright pulse-glow" />
                )}
                {line.length === 0 && remaining > 0 ? ' ' : null}
              </span>
            </div>
          )
        })}
      </code>
    </pre>
  )
}

export function countTokensChars(lines: CodeToken[][]): number {
  return lines.reduce(
    (sum, line) => sum + line.reduce((n, tok) => n + tok.text.length, 0),
    0,
  )
}
