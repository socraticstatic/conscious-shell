import { useEffect, useRef } from 'react'

export default function Heartbeat() {
  const driftRef = useRef(0)
  const prevSinRef = useRef(0)

  useEffect(() => {
    const onDrift = (e: Event) => {
      driftRef.current = (e as CustomEvent).detail.value
    }
    window.addEventListener('baseline:drift', onDrift)

    let rafId: number
    const start = performance.now()

    const loop = (now: number) => {
      const d = driftRef.current
      const bpm = d <= 0 ? 55 : d <= 50 ? 55 + (17 / 50) * d : d <= 80 ? 72 + (38 / 30) * (d - 50) : 110
      const freq = (bpm / 60) * Math.PI * 2
      const elapsed = (now - start) / 1000
      const sin = Math.sin(elapsed * freq)
      const t = (sin + 1) / 2

      const style = document.documentElement.style
      style.setProperty('--heartbeat-shadow', `${3 * t}`)

      const r = 94 + (255 - 94) * (d / 100)
      const g = 200 + (122 - 200) * (d / 100)
      const b = 216 + (92 - 216) * (d / 100)
      const a = 0.02 + (0.05 - 0.02) * (d / 100)
      style.setProperty('--heartbeat-color', `rgba(${r|0},${g|0},${b|0},${a.toFixed(3)})`)

      if (prevSinRef.current <= 0 && sin > 0) {
        window.dispatchEvent(new CustomEvent('heartbeat:beat'))
      }
      prevSinRef.current = sin
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('baseline:drift', onDrift)
    }
  }, [])

  return null
}
