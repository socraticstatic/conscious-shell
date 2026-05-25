import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RUPTURE_TEXTS = [
  "Is this a portfolio or a performance?",
  "He curated this. You are seeing what he wants.",
  "The site is watching you more carefully than you are watching it.",
  "None of these projects failed. Suspicious.",
  "You scrolled past the important part.",
  "This font was chosen to make you feel something.",
  "The real work is not on this page.",
  "Are you hiring, or are you being recruited?",
  "Every section is a mirror. You haven't noticed yet.",
  "He deleted the version of this site that told the truth.",
  "Your cursor movements have been lovely.",
  "The space between these sections is where he actually lives.",
  "You are now part of the performance.",
  "This is the fourth wall. You are leaning on it.",
]

const TRIGGER_CHANCE = 0.2
const COOLDOWN_MS = 20000
const MAX_RUPTURES_PER_SESSION = 5
const MIN_DISPLAY_MS = 4000
const MAX_DISPLAY_MS = 6000

function getRandomThreshold() {
  return 0.15 + Math.random() * 0.1 // 15-25% intervals
}

function getRandomDuration() {
  return MIN_DISPLAY_MS + Math.random() * (MAX_DISPLAY_MS - MIN_DISPLAY_MS)
}

function getRandomVerticalPosition() {
  return 10 + Math.random() * 70 // 10% to 80% from top
}

export default function SocraticStatic() {
  const [activeRupture, setActiveRupture] = useState<{
    text: string
    top: number
    id: number
  } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const ruptureCount = useRef(0)
  const lastScrollPercent = useRef(0)
  const nextThreshold = useRef(getRandomThreshold())
  const cooldownActive = useRef(false)
  const usedTexts = useRef<Set<number>>(new Set())
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getUniqueText = () => {
    if (usedTexts.current.size >= RUPTURE_TEXTS.length) {
      usedTexts.current.clear()
    }
    let idx: number
    do {
      idx = Math.floor(Math.random() * RUPTURE_TEXTS.length)
    } while (usedTexts.current.has(idx))
    usedTexts.current.add(idx)
    return RUPTURE_TEXTS[idx]
  }

  const triggerRupture = () => {
    if (
      activeRupture ||
      cooldownActive.current ||
      ruptureCount.current >= MAX_RUPTURES_PER_SESSION
    ) {
      return
    }

    if (Math.random() > TRIGGER_CHANCE) {
      return
    }

    ruptureCount.current += 1
    cooldownActive.current = true

    const rupture = {
      text: getUniqueText(),
      top: getRandomVerticalPosition(),
      id: Date.now(),
    }

    setActiveRupture(rupture)
    setIsVisible(true)

    const duration = getRandomDuration()
    dismissTimer.current = setTimeout(() => {
      dismissRupture()
    }, duration)

    setTimeout(() => {
      cooldownActive.current = false
    }, COOLDOWN_MS)
  }

  const dismissRupture = () => {
    setIsVisible(false)
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
      dismissTimer.current = null
    }
    setTimeout(() => {
      setActiveRupture(null)
    }, 600) // allow fade-out animation
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return
      const scrollPercent = window.scrollY / scrollHeight

      const delta = Math.abs(scrollPercent - lastScrollPercent.current)
      if (delta >= nextThreshold.current) {
        lastScrollPercent.current = scrollPercent
        nextThreshold.current = getRandomThreshold()
        triggerRupture()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [activeRupture])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <AnimatePresence>
        {activeRupture && isVisible && (
          <motion.div
            key={activeRupture.id}
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute left-0 w-full pointer-events-auto"
            style={{ top: `${activeRupture.top}%` }}
          >
            <div className="relative overflow-hidden">
              {/* Noise/static background */}
              <div className="absolute inset-0 bg-[#0a0604]/90 noise-bg" />

              {/* Scan line animation */}
              <div className="absolute inset-0 scan-line" />

              {/* Red/orange tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff7a5c]/5 via-transparent to-[#ff7a5c]/5" />

              {/* Content */}
              <div className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 md:px-12 gap-3">
                <p className="font-mono text-xs sm:text-sm md:text-base text-[#e8e4dc] flicker-text tracking-wide select-none leading-relaxed">
                  <span className="text-[#ff7a5c] mr-2 sm:mr-3">//</span>
                  {activeRupture.text}
                </p>
                <button
                  onClick={dismissRupture}
                  className="ml-2 text-[#e8e4dc]/50 hover:text-[#ff7a5c] active:text-[#ff7a5c] font-mono text-xs transition-colors duration-200 shrink-0"
                  aria-label="Dismiss"
                >
                  x
                </button>
              </div>

              {/* Top and bottom border glitch */}
              <div className="absolute top-0 left-0 w-full h-px bg-[#ff7a5c]/30 glitch-border" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-[#ff7a5c]/30 glitch-border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 100px 100px;
          animation: noise-shift 0.15s steps(3) infinite;
        }

        @keyframes noise-shift {
          0% { background-position: 0 0; }
          33% { background-position: -20px -15px; }
          66% { background-position: 15px -30px; }
          100% { background-position: -10px 20px; }
        }

        .scan-line {
          background: linear-gradient(
            transparent 0%,
            rgba(255, 122, 92, 0.03) 50%,
            transparent 100%
          );
          background-size: 100% 4px;
          animation: scan 4s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .flicker-text {
          animation: flicker 3s ease-in-out infinite;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          4% { opacity: 0.7; }
          6% { opacity: 1; }
          42% { opacity: 1; }
          44% { opacity: 0.5; }
          46% { opacity: 1; }
          80% { opacity: 1; }
          82% { opacity: 0.6; }
          83% { opacity: 1; }
        }

        .glitch-border {
          animation: glitch-shift 2s steps(5) infinite;
        }

        @keyframes glitch-shift {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
