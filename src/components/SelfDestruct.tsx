import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const TOTAL = 273

export default function SelfDestruct() {
  const [remaining, setRemaining] = useState(() => {
    const start = sessionStorage.getItem('sd-start')
    if (start) return Math.max(0, TOTAL - Math.floor((Date.now() - +start) / 1000))
    sessionStorage.setItem('sd-start', String(Date.now()))
    return TOTAL
  })
  const [phase, setPhase] = useState<'counting' | 'zero' | 'failed' | 'gone'>('counting')
  const [minimized, setMinimized] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    interval.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 0) { clearInterval(interval.current!); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval.current!)
  }, [])

  useEffect(() => {
    if (remaining === 0 && phase === 'counting') {
      setPhase('zero')
      setTimeout(() => setPhase('failed'), 2000)
      setTimeout(() => setPhase('gone'), 7000)
    }
  }, [remaining, phase])

  if (phase === 'gone') return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const progress = remaining / TOTAL
  const color = remaining < 30 ? '#ff006e' : remaining < 120 ? '#e040fb' : '#00d4ff'

  if (minimized) return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <button onClick={() => setMinimized(false)} className="font-mono text-sm" style={{ color }}>
        {timeStr} <span className="text-[8px] text-[#4a453e] ml-1">+</span>
      </button>
    </div>
  )

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40 hidden md:block max-w-[160px] rounded px-3 py-2 border"
      style={{ background: '#0b0a08', borderColor: remaining < 30 ? undefined : 'rgba(255,122,92,0.3)' }}
      animate={{
        borderColor: remaining < 30 ? ['rgba(255,122,92,0.3)', 'rgba(255,122,92,0.9)', 'rgba(255,122,92,0.3)'] : 'rgba(255,122,92,0.3)',
        x: remaining < 10 && phase === 'counting' ? [0, -1, 1, -1, 0] : 0,
      }}
      transition={{ borderColor: { duration: 1, repeat: Infinity }, x: { duration: 0.3, repeat: Infinity } }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[8px] tracking-[0.4em] uppercase" style={{ color: '#ff006e' }}>SELF-DESTRUCT</span>
        <button onClick={() => setMinimized(true)} className="text-[10px] text-[#4a453e] leading-none">-</button>
      </div>
      {phase === 'counting' || phase === 'zero' ? (
        <>
          <motion.div
            className="font-mono text-2xl mt-1"
            style={{ color }}
            animate={{ opacity: remaining < 60 && remaining > 0 ? [1, 0.4, 1] : 1 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {timeStr}
          </motion.div>
          <div className="h-[2px] w-full bg-[#1a1814] mt-1.5 rounded overflow-hidden">
            <div className="h-full rounded transition-all duration-1000" style={{ width: `${progress * 100}%`, background: color }} />
          </div>
          <p className="text-[8px] text-[#4a453e] mt-1 font-mono">// sequence initiated</p>
        </>
      ) : phase === 'failed' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] text-[#ff006e] font-mono mt-1 tracking-wider">DETONATION FAILED</p>
          <p className="text-[8px] text-[#4a453e] font-mono mt-0.5">// just kidding. it&apos;s a portfolio.</p>
        </motion.div>
      ) : null}
    </motion.div>
  )
}
