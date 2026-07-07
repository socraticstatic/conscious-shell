import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersonalization } from '../lib/personalization'
import { getIdentity, type Identity } from '../lib/identity'

const TRAIT_COLORS: Record<string, string> = {
  empathy: '#e040fb', logic: '#00d4ff', creativity: '#7aff8c', darkness: '#ff006e', honesty: '#ffffff',
}

export default function VisitorDossier() {
  const { profile, traits, active, resetProfile } = usePersonalization()
  const [open, setOpen] = useState(false)
  const [rawOpen, setRawOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [identity, setIdentity] = useState<Identity | null>(null)

  useEffect(() => { getIdentity().then(setIdentity).catch(() => {}) }, [])

  useEffect(() => {
    if (localStorage.getItem('vk-dossier')) setVisible(true)
    const handler = () => setVisible(true)
    window.addEventListener('vk:profile', handler)
    return () => window.removeEventListener('vk:profile', handler)
  }, [])

  useEffect(() => { if (active) setVisible(true) }, [active])

  if (!visible || !profile || !traits) return null

  const clear = () => {
    resetProfile()
    setVisible(false)
    setOpen(false)
    window.dispatchEvent(new CustomEvent('vk:reset'))
  }

  return (
    // Anchored top-right at every breakpoint (was bottom-left + bottom-44 on
    // mobile, which drifted over whatever page copy happened to scroll under
    // that fixed y-position — e.g. the biometrics panel, the contact section).
    // top-right sits just under the nav bar, clear of SessionHUD's mobile
    // marker (which lives on the left) and the bottom control dock.
    <div className="fixed z-30 top-20 right-4 max-w-[calc(100vw-1.5rem)]">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-[9px] tracking-widest font-mono border rounded"
            style={{ background: '#0b0a08', borderColor: '#e040fb', color: '#e040fb' }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 1h5l3 3v7H1z" /><path d="M6 1v3h3" />
            </svg>
            DOSSIER
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-[min(280px,calc(100vw-2rem))] max-h-[60vh] sm:max-h-[400px] overflow-y-auto rounded border font-mono text-[11px]"
            style={{ background: '#0b0a08', borderColor: '#1f1c17' }}
          >
            <div className="p-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] tracking-widest" style={{ color: '#e040fb' }}>VISITOR DOSSIER</span>
                <button onClick={() => setOpen(false)} className="text-[9px]" style={{ color: '#6b6660' }}>CLOSE</button>
              </div>
              <div className="text-sm" style={{ color: '#00d4ff' }}>{profile.name}</div>

              {identity && (
                <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#7aff8c' }}>
                  CLEARANCE: GRANTED // {identity.email}
                </div>
              )}

              <div>
                <div className="text-[9px] tracking-widest mb-1" style={{ color: '#6b6660' }}>TRAIT ANALYSIS</div>
                {(Object.keys(TRAIT_COLORS) as (keyof typeof traits)[]).map((t) => (
                  <div key={t} className="flex items-center gap-2 mb-1">
                    <span className="w-16 text-[9px] capitalize" style={{ color: '#6b6660' }}>{t}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1c17' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${traits[t]}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: TRAIT_COLORS[t] }}
                      />
                    </div>
                    <span className="w-6 text-right text-[9px]" style={{ color: TRAIT_COLORS[t] }}>{traits[t]}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[9px] tracking-widest mb-1" style={{ color: '#6b6660' }}>CLASSIFICATION</div>
                <div className="text-lg" style={{ color: '#e040fb' }}>{profile.name}</div>
                <div className="text-[11px] italic" style={{ color: '#6b6660' }}>{(profile as any).description || 'No description available'}</div>
              </div>

              <div>
                <div className="text-[9px] tracking-widest mb-1" style={{ color: '#6b6660' }}>SITE ADAPTATION</div>
                <div style={{ color: '#6b6660' }}>Palette: {Object.values(profile.palette)[0] ? 'custom' : 'default'}</div>
                <div style={{ color: '#6b6660' }}>Tone: {profile.tone}</div>
                <div style={{ color: '#6b6660' }}>Section priority: {profile.sectionOrder.slice(0, 3).join(', ')}</div>
              </div>

              <div>
                <button onClick={() => setRawOpen(!rawOpen)} className="text-[9px] tracking-widest" style={{ color: '#6b6660' }}>
                  {rawOpen ? '[-]' : '[+]'} RAW DATA
                </button>
                {rawOpen && (
                  <pre className="mt-1 p-2 rounded text-[9px] overflow-x-auto" style={{ background: '#1f1c17', color: '#6b6660' }}>
                    {JSON.stringify({ traits, answers: Object.keys(traits).length }, null, 2)}
                  </pre>
                )}
              </div>

              <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: '#1f1c17' }}>
                <span className="text-[9px] italic" style={{ color: '#6b6660' }}>// this dossier persists until cleared</span>
                <button onClick={clear} className="text-[9px] tracking-widest px-1 py-0.5 border rounded" style={{ color: '#ff006e', borderColor: '#ff006e' }}>
                  CLEAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
