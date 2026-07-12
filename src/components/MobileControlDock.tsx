import { useEffect, useState } from 'react';
import { Volume2, VolumeX, ChevronRight, ScrollText } from 'lucide-react';

/**
 * Control dock — every viewport.
 *
 * Started as the mobile consolidation of the four floating controls (ambient
 * audio, Helen narrator, dead-drop console, log viewer); desktop kept its
 * corner buttons and they never stopped colliding with content and each
 * other. Now the dock is the ONLY home for these controls at every size:
 * full-width taskbar on mobile, compact centered cluster above the
 * BlackLitany marquee on desktop. Do not reintroduce floating control
 * buttons — add controls here.
 *
 * Each button dispatches a CustomEvent; the owning components listen for it
 * and toggle. Audio/Helen report their on/off state back via `dock:state` so
 * the dock can light up the active control.
 */
type DockState = { audio: boolean };

export default function MobileControlDock() {
  const [state, setState] = useState<DockState>({ audio: false });

  useEffect(() => {
    const onState = (e: Event) => {
      const d = (e as CustomEvent).detail as { control?: keyof DockState; active?: boolean } | undefined;
      if (!d || !d.control) return;
      setState((s) => ({ ...s, [d.control as keyof DockState]: !!d.active }));
    };
    window.addEventListener('dock:state', onState);
    return () => window.removeEventListener('dock:state', onState);
  }, []);

  const fire = (name: string) => () => window.dispatchEvent(new CustomEvent(name));

  const items = [
    { key: 'audio', label: 'amb',   Icon: state.audio ? Volume2 : VolumeX, on: state.audio, accent: '#00d4ff', ev: 'dock:audio' },
    { key: 'drop',  label: 'drop',  Icon: ChevronRight, on: false,       accent: '#00d4ff', ev: 'dock:deaddrop' },
    { key: 'logs',  label: 'logs',  Icon: ScrollText,   on: false,       accent: '#a8a29e', ev: 'dock:logs' },
  ] as const;

  return (
    <nav
      aria-label="system controls"
      className="fixed inset-x-0 z-[45] flex items-stretch gap-1 px-2 lg:justify-center lg:pointer-events-none"
      style={{ bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))' }}
    >
      {items.map(({ key, label, Icon, on, accent, ev }) => (
        <button
          key={key}
          type="button"
          onClick={fire(ev)}
          aria-pressed={on}
          aria-label={label}
          className={`flex-1 lg:flex-none lg:pointer-events-auto min-w-0 inline-flex items-center justify-center gap-1.5 border bg-[#0b0a08]/85 backdrop-blur-sm px-1.5 lg:px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase transition-colors active:bg-[#0b0a08] ${
            on ? '' : 'border-[#1f1c17] text-[#6b6660] lg:hover:text-[#a8a29e] lg:hover:border-[#2a2620]'
          }`}
          style={on ? { borderColor: accent, color: accent } : undefined}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </nav>
  );
}
