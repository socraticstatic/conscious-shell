import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Echo {
  id: number
  text: string
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

export default function TypingEchoes() {
  const [echoes, setEchoes] = useState<Echo[]>([])
  const totalTyped = useRef(0)
  const lastSpawn = useRef(0)
  const idRef = useRef(0)

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      const val = target.value || ''
      totalTyped.current += 1
      if (totalTyped.current < 4) return
      const now = Date.now()
      if (now - lastSpawn.current < 800) return
      lastSpawn.current = now

      const delay = 1000 + Math.random() * 1000
      setTimeout(() => {
        if (val.length < 1) return
        const len = 3 + Math.floor(Math.random() * 6)
        const start = Math.max(0, Math.floor(Math.random() * (val.length - len)))
        let fragment = val.slice(start, start + len)
        if (Math.random() > 0.5) fragment = fragment.split('').reverse().join('')
        if (Math.random() > 0.7 && fragment.length > 2) {
          const i = Math.floor(Math.random() * (fragment.length - 1))
          const arr = fragment.split('')
          ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
          fragment = arr.join('')
        }

        const echo: Echo = {
          id: idRef.current++,
          text: fragment,
          x: Math.random() * 90 + 5,
          y: Math.random() * 85 + 5,
          color: Math.random() > 0.5 ? '#e040fb' : '#00d4ff',
          size: 12 + Math.floor(Math.random() * 5),
          rotation: Math.random() * 30 - 15,
        }

        setEchoes(prev => {
          const next = [...prev, echo]
          return next.length > 8 ? next.slice(-8) : next
        })
        setTimeout(() => setEchoes(prev => prev.filter(e => e.id !== echo.id)), 6000)
      }, delay)
    }

    document.addEventListener('input', handler)
    return () => document.removeEventListener('input', handler)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
      <AnimatePresence>
        {echoes.map(echo => (
          <motion.span
            key={echo.id}
            initial={{ opacity: 0.4, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            style={{
              position: 'fixed',
              left: `${echo.x}%`,
              top: `${echo.y}%`,
              color: echo.color,
              fontSize: `${echo.size}px`,
              fontFamily: 'monospace',
              transform: `rotate(${echo.rotation}deg)`,
              textShadow: '0 0 8px currentColor',
            }}
          >
            {echo.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
