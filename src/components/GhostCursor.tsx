import { useEffect, useRef, useState } from 'react'

type Point = { x: number; y: number; t: number }

export default function GhostCursor() {
  const buffer = useRef<Point[]>([])
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number>(0)
  const startIdx = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return

    const resetIdle = () => {
      if (active) { setActive(false); cancelAnimationFrame(rafRef.current) }
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        if (buffer.current.length > 10) { startIdx.current = 0; startTime.current = 0; setActive(true) }
      }, 30000)
    }

    const onMove = (e: MouseEvent) => {
      const pt: Point = { x: e.clientX, y: e.clientY, t: Date.now() }
      if (buffer.current.length >= 500) buffer.current.shift()
      buffer.current.push(pt)
      resetIdle()
    }

    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (idleTimer.current) clearTimeout(idleTimer.current) }
  }, [active])

  useEffect(() => {
    if (!active || buffer.current.length < 2) return
    const pts = [...buffer.current]
    const baseTime = pts[0].t
    let start: number | null = null

    const step = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const targetTime = baseTime + elapsed
      let idx = pts.findIndex(p => p.t >= targetTime)
      if (idx === -1) { setActive(false); return }
      if (idx === 0) idx = 1
      const a = pts[idx - 1], b = pts[idx]
      const frac = (targetTime - a.t) / (b.t - a.t || 1)
      setPos({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none hidden md:block">
      <div
        className="absolute animate-[flicker_0.8s_ease-in-out_infinite]"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      >
        <svg
          width="20" height="24" viewBox="0 0 20 24" fill="none"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,122,92,0.3))' }}
        >
          <path
            d="M1 1L1 18L5 14L8 22L11 21L8 13L14 13L1 1Z"
            fill="#ff7a5c" fillOpacity="0.4" stroke="#ff7a5c" strokeOpacity="0.6" strokeWidth="0.5"
          />
        </svg>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />
        <span
          className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
          style={{ fontSize: '8px', color: '#ff7a5c', opacity: 0.3 }}
        >
          was here
        </span>
      </div>
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.4; }
          25% { opacity: 0.2; }
          50% { opacity: 0.5; }
          75% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
