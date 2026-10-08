import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Soft spotlight under the cursor — slightly brighter, never harsh. */
export function CursorGlow() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!visible) {
        visible = true
        el.style.opacity = '1'
      }
    }

    const onLeave = () => {
      visible = false
      el.style.opacity = '0'
    }

    const tick = () => {
      x += (tx - x) * 0.14
      y += (ty - y) * 0.14
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[5] opacity-0 transition-opacity duration-300"
      style={{
        width: 420,
        height: 420,
        marginLeft: -210,
        marginTop: -210,
        background:
          'radial-gradient(circle, rgba(167,139,255,0.16) 0%, rgba(139,108,255,0.07) 35%, transparent 68%)',
        mixBlendMode: 'screen',
        willChange: 'transform',
      }}
      aria-hidden
    />
  )
}
