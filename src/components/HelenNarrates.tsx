import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getIdentity, type Identity } from '../lib/identity'

// Keys MUST match real <section id> values. The hero is `top`, the wayback is
// `time` — earlier these were keyed `hero`/`archive`, so Helen was mute on the
// two sections a visitor sees first, which read as a broken toggle.
const GREETING =
  'I am Helen. I will tell you what he will not. Scroll, and I will narrate him.'

const NARRATIONS: Record<string, string> = {
  'top': 'He starts here because he loves the view. The city is always bigger than the person. The person is always bigger than they let on.',
  'work': 'Twelve projects. Each one a door he walked through and closed behind him. Each closing sounds the same.',
  'time': 'He keeps the dead versions. Most people bury theirs. He visits them like graves.',
  'empathy': 'The test is for you, not him. He already knows the answer. The answer changes nothing.',
  'lab': 'Six repositories. The source code is the autobiography he actually meant to write. The one without metaphors.',
  'esper': 'Enhance. Always enhance. Never accept the first layer of anything. The truth is always one zoom deeper than you think.',
  'manifesto': 'Words he wrote at 2am when no one was hiring. They still hold. They hold him together.',
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
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [lineText, setLineText] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fullTextRef = useRef('')

  // Silencing is not one call. On macOS and iOS, cancel() alone can let the
  // buffered phrase play to its end, and pause() can leave the engine stuck in
  // a paused state that mutes every later speak(). pause → cancel → resume
  // stops the audio AND clears the flag; the delayed second cancel() catches
  // engines that re-assert their queue a tick later.
  const hush = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      const synth = window.speechSynthesis
      synth.pause()
      synth.cancel()
      synth.resume()
      if (hushTimerRef.current) clearTimeout(hushTimerRef.current)
      hushTimerRef.current = setTimeout(() => {
        try { synth.cancel() } catch { /* ignore */ }
      }, 80)
    } catch { /* ignore */ }
  }

  // Helen actually speaks now — the Mic icon was a promise the feature never
  // kept. Browser speechSynthesis, no server. The toggle click is the user
  // gesture browsers require, so the first utterance is allowed to play.
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (document.hidden) return // a tab you cannot see must not talk
    try {
      // a pending delayed hush-cancel would kill this new utterance
      if (hushTimerRef.current) clearTimeout(hushTimerRef.current)
      window.speechSynthesis.cancel()
      window.speechSynthesis.resume()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.92
      u.pitch = 1.02
      u.volume = 0.9
      const voices = window.speechSynthesis.getVoices()
      const pref =
        voices.find((v) => /samantha|victoria|fiona|karen|moira|tessa|zira|female/i.test(v.name)) ||
        voices.find((v) => /^en[-_]/i.test(v.lang))
      if (pref) u.voice = pref
      window.speechSynthesis.speak(u)
    } catch {
      /* speech unavailable — text narration still carries the feature */
    }
  }

  useEffect(() => {
    sessionStorage.setItem('helen-active', String(active))
    window.dispatchEvent(new CustomEvent('dock:state', { detail: { control: 'helen', active } }))
  }, [active])

  // Fetch identity once so the first greeting of a fresh session can know
  // who cleared the door. Null in dev flows that bypass the gate.
  useEffect(() => {
    getIdentity().then(setIdentity).catch(() => {})
  }, [])

  // Toggle ON → greet immediately, independent of scroll position, so the
  // control visibly (and audibly) responds even at the un-narrated hero.
  // Toggle OFF → fall silent at once. The very first greeting of a fresh
  // session (sessionStorage-scoped) is personalized when identity exists;
  // every later toggle-on this session falls back to the standard greeting.
  useEffect(() => {
    if (active) {
      const alreadyGreeted = sessionStorage.getItem('helen-greeted') === 'true'
      if (!alreadyGreeted && identity) {
        setLineText(`Welcome back, ${identity.name}. Your clearance is current.`)
        sessionStorage.setItem('helen-greeted', 'true')
      } else {
        setLineText(GREETING)
      }
    } else {
      setLineText('')
      setCurrentSection(null)
      fullTextRef.current = ''
      hush()
    }
  }, [active, identity])

  // Once scrolling settles on a narrated section, switch to its line.
  useEffect(() => {
    if (active && currentSection && NARRATIONS[currentSection]) setLineText(NARRATIONS[currentSection])
  }, [active, currentSection])

  // Cancel any speech if the component unmounts mid-sentence, and fall silent
  // the moment the tab is hidden or unloaded — a voice with no visible bar
  // reads as Helen refusing to shut up.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) hush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', hush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', hush)
      hush()
    }
  }, [])

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
    if (!active || !lineText) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    const text = lineText
    if (text === fullTextRef.current) return
    fullTextRef.current = text
    setDisplayedText('')
    setIsTyping(true)
    speak(text)

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
  }, [lineText, active])

  return (
    <>
      {/* No floating toggle here — the control dock owns the helen button at
          every viewport and drives this component via the dock:helen event. */}

      {/* Narration Bar — z-[80]: above the ambient corner HUDs (IntelligenceHUD
          z-70, MemoryDecay z-50, DeadDrop panel z-55), below takeover overlays
          (ExitIntent/TimeSkip z-95, NarratorOverlay z-200). A dialogue the user
          summoned must never render under passive decoration.

          Centering must come from left-0/right-0 + flex, NOT translate-x:
          framer-motion writes an inline transform for the y animation, which
          silently erases any Tailwind translate and shoves the bar 300px right
          into the intel HUD and the button rail.

          Desktop bottom lane is 5rem: the marquee owns 0-22px, the corner
          readouts own ~32-65px, the narration floats above all of them. */}
      <AnimatePresence>
        {active && displayedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed left-0 right-0 z-[80] flex justify-center px-4 pointer-events-none bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] max-lg:bottom-[calc(86px+env(safe-area-inset-bottom,0px))]"
          >
            <div className="w-full max-w-[600px] pointer-events-auto bg-[#0b0a08]/95 backdrop-blur border-t border-[#e040fb]/30 rounded-lg px-3 sm:px-5 py-3 sm:py-4">
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
