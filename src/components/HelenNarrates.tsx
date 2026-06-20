import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic } from 'lucide-react'

const NARRATIONS: Record<string, string> = {
  'hero': 'He starts here because he wants you to feel small. The city is always bigger than the person. The person is always bigger than they let on.',
  'work': 'Twelve projects. Each one a door he walked through and closed behind him. Each closing sounds the same.',
  'archive': 'He keeps the dead versions. Most people bury theirs. He visits them like graves.',
  'empathy': 'The test is for you, not him. He already knows the answer. The answer changes nothing.',
  'lab': 'Six repositories. The source code is the autobiography he actually meant to write. The one without metaphors.',
  'esper': 'Enhance. Always enhance. Never accept the first layer of anything. The truth is always one zoom deeper than you think.',
  'manifesto': 'Words he wrote at 2am when no one was hiring. They still hold. They hold him together.',
  'human': 'The trivia is a deflection. A warm handshake before the real conversation. He is afraid of the real conversation.',
  'haiku': 'Seventeen syllables to say what the portfolio cannot. What the portfolio cannot say would fill another portfolio.',
  'index': 'A list. He loves lists. Control dressed as organization. Organization dressed as sanity.',
  'impact': 'Numbers. The language hiring managers speak when they have forgotten how to listen. He learned the language. He has not forgotten.',
  'about': 'The only section where he uses first person. Notice that. Notice what it costs him.',
  'dossier': 'Everything you need to know is here. Everything you want to know is not. The gap between those two things is where he actually lives.',
  'services': 'What he will do for money. What he will not is the more interesting list. The most interesting list is what he does for free at 3am.',
  'recognition': 'Awards. Proof that other people agreed with him, temporarily. Temporarily is the only way anyone agrees with anyone.',
  'contact': 'The end. Or the beginning. Depends on what you type next. Depends on whether you meant to find him or stumbled here by accident. He hopes it was on purpose.',
  'certifications': 'Cornell. Four certificates. Not trophies — translations. The curriculum gave names to things he had been doing unnamed for years. Now the unnamed things have vocabulary. The loneliness of knowing remains.',
}

function Waveform() {
  return (
    <div className="flex items-end gap-[2px] h-3 ml-2">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[2px] bg-[#e040fb] rounded-full"
          animate={{ height: ['4px', '12px', '4px'] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export default function HelenNarrates() {
  const [active, setActive] = useState(() => sessionStorage.getItem('helen-active') === 'true')
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fullTextRef = useRef('')

  useEffect(() => {
    sessionStorage.setItem('helen-active', String(active))
    window.dispatchEvent(new CustomEvent('dock:state', { detail: { control: 'helen', active } }))
  }, [active])

  // Mobile dock integration: the dock's helen button toggles narration.
  useEffect(() => {
    const onDock = () => setActive((v) => !v)
    window.addEventListener('dock:helen', onDock)
    return () => window.removeEventListener('dock:helen', onDock)
  }, [])

  useEffect(() => {
    if (!active) return
    const sections = document.querySelectorAll('section[id]')
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) setCurrentSection(visible[0].target.id)
      },
      { threshold: 0.3 }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [active])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!active || !currentSection || !NARRATIONS[currentSection]) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    const text = NARRATIONS[currentSection]
    if (text === fullTextRef.current) return
    fullTextRef.current = text
    setDisplayedText('')
    setIsTyping(true)

    let i = 0
    const type = () => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
        timerRef.current = setTimeout(type, 30)
      } else {
        setIsTyping(false)
      }
    }
    timerRef.current = setTimeout(type, 30)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, currentSection])

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setActive(!active)}
        aria-label={active ? 'silence helen' : 'let helen narrate'}
        className={`fixed z-40 max-sm:hidden inline-flex items-center gap-2 px-3 py-2 border backdrop-blur-sm text-[10px] tracking-[0.3em] uppercase transition-colors right-6 ${
          active
            ? 'border-[#e040fb]/60 text-[#e040fb] bg-[#0b0a08]/80'
            : 'border-[#1f1c17] text-[#6b6660] bg-[#0b0a08]/60 hover:border-[#e040fb]/40 hover:text-[#e040fb]'
        }`}
        style={{ bottom: 'calc(108px + env(safe-area-inset-bottom, 0px))' }}
      >
        <Mic className="w-3.5 h-3.5" />
        helen
      </button>

      {/* Narration Bar */}
      <AnimatePresence>
        {active && displayedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-full max-w-[600px] bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-sm:bottom-[calc(86px+env(safe-area-inset-bottom,0px))]"
          >
            <div className="bg-[#0b0a08]/95 backdrop-blur border-t border-[#e040fb]/30 rounded-lg px-3 sm:px-5 py-3 sm:py-4">
              <div className="flex items-center mb-1.5 sm:mb-2">
                <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#e040fb] font-mono uppercase">
                  Helen // Narrator
                </span>
                {isTyping && <Waveform />}
              </div>
              <p className="font-serif italic text-[#efe6d4] text-xs sm:text-sm leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse ml-[1px]">|</span>}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
