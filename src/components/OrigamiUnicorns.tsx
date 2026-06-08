import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'origami-unicorns-found'

const unicornPositions = [
  { id: 0, top: '3%', left: '2%', size: 14, baseOpacity: 0.08 },
  { id: 1, bottom: '5%', right: '3%', size: 16, baseOpacity: 0.06 },
  { id: 2, top: '48%', left: '1%', size: 13, baseOpacity: 0.05 },
  { id: 3, top: '72%', right: '2%', size: 15, baseOpacity: 0.04 },
  { id: 4, top: '15%', right: '1.5%', size: 12, baseOpacity: 0.07 },
  { id: 5, bottom: '20%', left: '3%', size: 18, baseOpacity: 0.05 },
  { id: 6, top: '88%', left: '45%', size: 14, baseOpacity: 0.12 },
]

function getInitialFound(): boolean[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed
      }
    }
  } catch {}
  return Array(7).fill(false)
}

export default function OrigamiUnicorns() {
  const [found, setFound] = useState<boolean[]>(getInitialFound)
  const [allFoundTime, setAllFoundTime] = useState<number | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  const foundCount = found.filter(Boolean).length

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  }, [found])

  useEffect(() => {
    if (foundCount === 7 && allFoundTime === null) {
      setAllFoundTime(Date.now())
      setShowMessage(true)
      window.dispatchEvent(new CustomEvent('narrator:trigger:origami'))
      const timer = setTimeout(() => setShowMessage(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [foundCount, allFoundTime])

  const handleFound = (index: number) => {
    if (!found[index]) {
      setFound((prev) => {
        const next = [...prev]
        next[index] = true
        return next
      })
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {unicornPositions.map((pos) => {
        const isFound = found[pos.id]
        const style: React.CSSProperties = {
          position: 'fixed',
          ...(pos.top && { top: pos.top }),
          ...(pos.bottom && { bottom: pos.bottom }),
          ...(pos.left && { left: pos.left }),
          ...(pos.right && { right: pos.right }),
        }

        return (
          <motion.div
            key={pos.id}
            className="pointer-events-auto cursor-pointer"
            style={style}
            initial={{ opacity: isFound ? 0.3 : pos.baseOpacity }}
            animate={{ opacity: isFound ? 0.3 : pos.baseOpacity }}
            whileHover={{
              opacity: 1,
              filter: 'drop-shadow(0 0 6px #e040fb) drop-shadow(0 0 12px #e040fb)',
              scale: 1.3,
            }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => handleFound(pos.id)}
          >
            <svg
              width={pos.size}
              height={pos.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 20L8 12L12 16L16 8L14 4L18 2L20 6L22 4L20 10L16 12L18 18L14 20L12 16L8 18L4 20Z"
                fill="#e040fb"
                stroke="#e040fb"
                strokeWidth="0.5"
                strokeLinejoin="bevel"
              />
              <path
                d="M14 4L12 8L8 12L12 16"
                stroke="#b8860b"
                strokeWidth="0.3"
                strokeLinejoin="bevel"
                fill="none"
              />
              <path
                d="M16 8L20 6L20 10L16 12"
                stroke="#b8860b"
                strokeWidth="0.3"
                strokeLinejoin="bevel"
                fill="none"
              />
            </svg>
          </motion.div>
        )
      })}

      {/* Counter */}
      <motion.div
        className="pointer-events-auto fixed bottom-3 left-3 select-none font-mono text-[10px] text-[#e040fb]"
        initial={{ opacity: 0.2 }}
        whileHover={{ opacity: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {foundCount}/{unicornPositions.length}
      </motion.div>

      {/* All found message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap italic text-[11px] text-[#e040fb]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            You found them all. It doesn&apos;t prove anything — but then again, what does?
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
