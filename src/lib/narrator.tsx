import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from './supabase'

type Reality = 'public' | 'honest'
type TriggerKey = 'origami_found' | 'console_command' | 'baseline_failed'
type Triggers = Record<TriggerKey, boolean>
type AlternateCopy = Record<string, { original: string[]; honest: string[] }>

export interface NarratorContextType {
  reality: Reality
  triggers: Triggers
  unlocked: boolean
  transitioning: boolean
  alternateCopy: AlternateCopy
  activateTrigger: (trigger: TriggerKey) => void
  toggleReality: () => void
  getCopy: (sectionKey: string, index: number) => string
}

const defaultTriggers: Triggers = { origami_found: false, console_command: false, baseline_failed: false }

export const NarratorContext = createContext<NarratorContextType | null>(null)

function getVisitorId(): string {
  let id = localStorage.getItem('visitor-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('visitor-id', id)
  }
  return id
}

function loadTriggers(): Triggers {
  try {
    const stored = localStorage.getItem('narrator-triggers')
    return stored ? { ...defaultTriggers, ...JSON.parse(stored) } : { ...defaultTriggers }
  } catch {
    return { ...defaultTriggers }
  }
}

export function NarratorProvider({ children }: { children: ReactNode }) {
  const [reality, setReality] = useState<Reality>('public')
  const [triggers, setTriggers] = useState<Triggers>(loadTriggers)
  const [unlocked, setUnlocked] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [alternateCopy, setAlternateCopy] = useState<AlternateCopy>({})

  useEffect(() => {
    getVisitorId()
    supabase
      .from('narrator_alternate_copy')
      .select('*')
      .then(({ data }) => {
        if (!data) return
        const copy: AlternateCopy = {}
        for (const row of data) {
          copy[row.section_key] = { original: row.original, honest: row.honest }
        }
        setAlternateCopy(copy)
      })
  }, [])

  useEffect(() => {
    const allTriggered = Object.values(triggers).every(Boolean)
    if (allTriggered && !unlocked) {
      setUnlocked(true)
      window.dispatchEvent(new CustomEvent('narrator:unlocked'))
    }
  }, [triggers, unlocked])

  const activateTrigger = useCallback((trigger: TriggerKey) => {
    setTriggers((prev) => {
      const next = { ...prev, [trigger]: true }
      localStorage.setItem('narrator-triggers', JSON.stringify(next))
      return next
    })
  }, [])

  const toggleReality = useCallback(() => {
    if (!unlocked) return
    setTransitioning(true)
    setTimeout(() => {
      setReality((prev) => (prev === 'public' ? 'honest' : 'public'))
      setTimeout(() => setTransitioning(false), 3000)
    }, 0)
  }, [unlocked])

  const getCopy = useCallback(
    (sectionKey: string, index: number): string => {
      const section = alternateCopy[sectionKey]
      if (!section) return ''
      const pool = reality === 'honest' ? section.honest : section.original
      return pool[index] ?? ''
    },
    [alternateCopy, reality]
  )

  return (
    <NarratorContext.Provider
      value={{ reality, triggers, unlocked, transitioning, alternateCopy, activateTrigger, toggleReality, getCopy }}
    >
      {children}
    </NarratorContext.Provider>
  )
}

export function useNarrator(): NarratorContextType {
  const ctx = useContext(NarratorContext)
  if (!ctx) throw new Error('useNarrator must be used within NarratorProvider')
  return ctx
}
