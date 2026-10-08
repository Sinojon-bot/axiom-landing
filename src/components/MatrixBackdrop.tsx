import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const SNIPPETS = [
  'useProfile',
  'useState',
  'useEffect',
  'AbortController',
  'fetchProfile',
  'signal',
  'async',
  'await',
  'return',
  'const',
  'export',
  'function',
  'Profile',
  'userId',
  '.then',
  '.catch',
  'abort()',
  'null',
  'string',
  '=>',
  '{}',
  'LoginForm',
  'onSubmit',
  'axiom',
]

/** Soft neural field + faint scattered code on the page background (not the shell). */
export function MatrixBackdrop() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0

    const dots = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00016,
      r: 0.6 + Math.random() * 1.1,
    }))

    type Drift = {
      x: number
      y: number
      speed: number
      text: string
      alpha: number
      size: number
    }
    let drifts: Drift[] = []

    const rebuildDrifts = () => {
      const count = Math.min(90, Math.floor((w * h) / 14000) + 48)
      drifts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.14 + Math.random() * 0.36,
        text: SNIPPETS[(Math.random() * SNIPPETS.length) | 0],
        alpha: 0.16 + Math.random() * 0.22,
        size: 11 + Math.random() * 4,
      }))
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rebuildDrifts()
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0 || d.x > 1) d.vx *= -1
        if (d.y < 0 || d.y > 1) d.vy *= -1
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i]
          const b = dots[j]
          const dx = (a.x - b.x) * w
          const dy = (a.y - b.y) * h
          const dist = Math.hypot(dx, dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.strokeStyle = `rgba(139, 108, 255, ${0.05 * (1 - dist / 150)})`
            ctx.stroke()
          }
        }
      }
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(212, 196, 255, 0.14)'
        ctx.fill()
      }

      // faint scattered code drifting down
      for (const s of drifts) {
        s.y += s.speed
        if (s.y > h + 24) {
          s.y = -20
          s.x = Math.random() * w
          s.text = SNIPPETS[(Math.random() * SNIPPETS.length) | 0]
          s.alpha = 0.16 + Math.random() * 0.22
        }
        ctx.font = `${s.size}px "IBM Plex Mono", monospace`
        ctx.fillStyle = `rgba(212, 196, 255, ${s.alpha})`
        ctx.fillText(s.text, s.x, s.y)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 opacity-75"
      aria-hidden
    />
  )
}
