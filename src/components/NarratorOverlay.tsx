import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNarrator } from '../lib/narrator'

const UNLOCK_TEXT_1 = 'THE PUBLIC VERSION IS A PERFORMANCE. YOU FOUND THE SEAMS.'
const UNLOCK_TEXT_2 = 'SWITCHING TO HONEST MODE.'

export default function NarratorOverlay() {
  const { reality, transitioning } = useNarrator()
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null)
  const [unlockPhase, setUnlockPhase] = useState<'idle' | 'flash' | 'text' | 'fade'>('idle')
  const [revealedChars, setRevealedChars] = useState(0)
  const [showLine2, setShowLine2] = useState(false)

  // Trigger flash notifications
  useEffect(() => {
    const counts = { origami: 1, console: 2, baseline: 3 }
    const handler = (e: Event) => {
      const type = (e as CustomEvent).detail?.type || e.type.split(':').pop()
      const n = counts[type as keyof typeof counts] || 1
      setTriggerMsg(`TRIGGER ${n}/3`)
      setTimeout(() => setTriggerMsg(null), 2000)
    }
    const events = ['narrator:trigger:origami', 'narrator:trigger:console', 'narrator:trigger:baseline']
    events.forEach(ev => window.addEventListener(ev, handler))
    return () => events.forEach(ev => window.removeEventListener(ev, handler))
  }, [])

  // Unlock sequence
  useEffect(() => {
    const handler = () => {
      setUnlockPhase('flash')
      setTimeout(() => {
        setUnlockPhase('text')
        setRevealedChars(0)
        setShowLine2(false)
      }, 100)
    }
    window.addEventListener('narrator:unlocked', handler)
    return () => window.removeEventListener('narrator:unlocked', handler)
  }, [])

  // Character-by-character reveal
  useEffect(() => {
    if (unlockPhase !== 'text') return
    const total = UNLOCK_TEXT_1.length
    if (revealedChars < total) {
      const t = setTimeout(() => setRevealedChars(c => c + 1), 40)
      return () => clearTimeout(t)
    }
    if (!showLine2) {
      const t = setTimeout(() => setShowLine2(true), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setUnlockPhase('fade'), 1200)
    return () => clearTimeout(t)
  }, [unlockPhase, revealedChars, showLine2])

  useEffect(() => {
    if (unlockPhase === 'fade') {
      const t = setTimeout(() => setUnlockPhase('idle'), 1000)
      return () => clearTimeout(t)
    }
  }, [unlockPhase])

  return (
    <>
      {/* Trigger notification */}
      <AnimatePresence>
        {triggerMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none font-mono text-amber-400 text-xs tracking-widest bg-black/80 px-4 py-2 border border-amber-400/40"
          >
            {triggerMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock flash */}
      <AnimatePresence>
        {unlockPhase === 'flash' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[200] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Unlock text sequence */}
      <AnimatePresence>
        {(unlockPhase === 'text' || unlockPhase === 'fade') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: unlockPhase === 'fade' ? 1 : 0.3 }}
            className="fixed inset-0 z-[200] bg-[rgba(11,10,8,0.97)] flex flex-col items-center justify-center pointer-events-none font-mono"
          >
            <p className="text-stone-200 text-sm tracking-wide max-w-md text-center">
              {UNLOCK_TEXT_1.slice(0, revealedChars)}
              <span className="animate-pulse">_</span>
            </p>
            {showLine2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-400 text-xs tracking-widest mt-4"
              >
                {UNLOCK_TEXT_2}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reality transition - CRT scan effect */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] pointer-events-none"
            style={{ background: 'rgba(11, 10, 8, 0.95)' }}
          >
            <motion.div
              initial={{ top: '-4px' }}
              animate={{ top: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-stone-400/60 shadow-[0_0_20px_rgba(200,200,200,0.3)]"
            />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-stone-500 text-[10px] tracking-widest opacity-60">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                REWRITING REALITY
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Honest mode indicator */}
      <AnimatePresence>
        {reality === 'honest' && !transitioning && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-4 right-4 z-[200] flex items-center gap-2 font-mono"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="text-[8px] uppercase tracking-widest text-stone-400">
              HONEST MODE
            </span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('narrator:toggle'))}
              className="pointer-events-auto text-[8px] uppercase tracking-widest text-stone-600 hover:text-stone-300 border border-stone-700 px-1.5 py-0.5 transition-colors"
            >
              EXIT
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
