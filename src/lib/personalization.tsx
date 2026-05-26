import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Traits = { empathy: number; logic: number; creativity: number; darkness: number; honesty: number }
type Profile = { name: string; palette: Record<string, string>; sectionOrder: string[]; tone: string }
type PersonalizationState = {
  active: boolean
  profile: Profile | null
  traits: Traits | null
  applyProfile(profile: Profile, traits?: Traits): void
  resetProfile(): void
  getTone(): string
}

export const PersonalizationContext = createContext<PersonalizationState>({
  active: false, profile: null, traits: null,
  applyProfile() {}, resetProfile() {}, getTone: () => 'formal',
})

function activateProfile(profile: Profile | null | undefined) {
  if (!profile || !profile.palette || typeof profile.palette !== 'object') return
  const el = document.documentElement
  const p = profile.palette
  if (p.primary) el.style.setProperty('--p-primary', p.primary)
  if (p.secondary) el.style.setProperty('--p-secondary', p.secondary)
  if (p.accent) el.style.setProperty('--p-accent', p.accent)
  if (p.bg) el.style.setProperty('--p-bg', p.bg)
  if (p.text) el.style.setProperty('--p-text', p.text)
  if (profile.name) el.dataset.personality = profile.name.toLowerCase().replace(' ', '-')
  window.dispatchEvent(new CustomEvent('personalization:applied', { detail: { sectionOrder: profile.sectionOrder ?? [] } }))
}

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [traits, setTraits] = useState<Traits | null>(null)
  const [active, setActive] = useState(false)

  const applyProfile = (p: Profile, t?: Traits) => {
    setProfile(p); setTraits(t || null); setActive(true)
    localStorage.setItem('vk-dossier', JSON.stringify({ profile: p, traits: t }))
    activateProfile(p)
  }

  const resetProfile = () => {
    setProfile(null); setTraits(null); setActive(false)
    localStorage.removeItem('vk-dossier')
    const el = document.documentElement
    ;['--p-primary','--p-secondary','--p-accent','--p-bg','--p-text'].forEach(v => el.style.removeProperty(v))
    delete el.dataset.personality
  }

  const getTone = () => profile?.tone || 'formal'

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vk-dossier')
      if (stored) {
        const parsed = JSON.parse(stored)
        const p = parsed?.profile
        const t = parsed?.traits
        if (p && p.palette && typeof p.palette === 'object') {
          setProfile(p); setTraits(t || null); setActive(true)
          activateProfile(p)
        } else {
          // Older flat-shape dossier from a previous build crashes if loaded; discard it.
          localStorage.removeItem('vk-dossier')
        }
      }
    } catch {
      localStorage.removeItem('vk-dossier')
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const p = detail?.profile
      const t = detail?.traits
      if (p) applyProfile(p, t)
    }
    window.addEventListener('vk:profile', handler)
    return () => window.removeEventListener('vk:profile', handler)
  }, [])

  return (
    <PersonalizationContext.Provider value={{ active, profile, traits, applyProfile, resetProfile, getTone }}>
      {children}
    </PersonalizationContext.Provider>
  )
}

export const usePersonalization = () => useContext(PersonalizationContext)

export function getPersonalizedOrder(sections: string[], profile: Profile): string[] {
  const order = profile.sectionOrder
  const ordered = order.filter(s => sections.includes(s))
  const rest = sections.filter(s => !order.includes(s))
  return [...ordered, ...rest]
}

export function toneModifier(text: string, tone: string): string {
  if (tone === 'formal') return text
  const sentences = text.split(/(?<=[.!?])\s+/)
  if (tone === 'casual') {
    return sentences.map(s => s.charAt(0).toLowerCase() + s.slice(1)).join(' ')
  }
  if (tone === 'cryptic') {
    return sentences
      .map(s => s.split(' ').filter((_, i) => i % 4 !== 2).join(' '))
      .join(' ... ')
  }
  if (tone === 'confrontational') {
    return sentences
      .map(s => s.split(' ').slice(0, Math.ceil(s.split(' ').length * 0.7)).join(' '))
      .map(s => `*${s}*`)
      .join(' ')
  }
  return text
}
