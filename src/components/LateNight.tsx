import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const isLateNight = () => {
  const h = new Date().getHours()
  return h >= 23 || h < 5
}

export default function LateNight() {
  const [active, setActive] = useState(isLateNight)
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('late-night-dismissed') === '1')
  const [showFragment, setShowFragment] = useState(false)
  const [fragPos] = useState(() => ({ x: 10 + Math.random() * 60, y: 20 + Math.random() * 50 }))

  useEffect(() => {
    const interval = setInterval(() => setActive(isLateNight()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (active) {
      document.documentElement.classList.add('late-night')
    } else {
      document.documentElement.classList.remove('late-night')
    }
    return () => document.documentElement.classList.remove('late-night')
  }, [active])

  useEffect(() => {
    if (!active || dismissed) return
    const show = setTimeout(() => setShowFragment(true), 10_000)
    const hide = setTimeout(() => setShowFragment(false), 20_000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [active, dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('late-night-dismissed', '1')
  }

  if (!active || dismissed) return null

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex items-center justify-between px-4"
        style={{ height: 28, background: 'rgba(20, 5, 5, 0.9)', boxShadow: '0 0 12px rgba(255, 60, 30, 0.15)' }}
      >
        <span className="text-[11px] italic" style={{ color: '#ff006e' }}>
          you're up late. so is he.
        </span>
        <button
          onClick={handleDismiss}
          className="pointer-events-auto opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={12} color="#ff006e" />
        </button>
      </div>

      <AnimatePresence>
        {showFragment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed z-50 pointer-events-none text-[10px] italic"
            style={{ left: `${fragPos.x}%`, top: `${fragPos.y}%`, color: 'rgba(255, 122, 92, 0.6)' }}
          >
            the site looks different after midnight. you noticed.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
