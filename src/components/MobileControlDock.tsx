import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic, ChevronRight, ScrollText } from 'lucide-react';

/**
 * Mobile-only control dock.
 *
 * On phones there is no room for the four floating controls (ambient audio,
 * Helen narrator, dead-drop console, log viewer) to live in the corners
 * without colliding with each other and with the content. Instead of hiding
 * them, this consolidates them into a single thumb-reachable "system bar" that
 * sits directly above the BlackLitany status marquee — together they read as a
 * Blade-Runner terminal taskbar.
 *
 * Each button dispatches a CustomEvent; the original controls listen for it and
 * toggle. Audio/Helen report their on/off state back via `dock:state` so the
 * dock can light up the active control.
 */
type DockState = { audio: boolean; helen: boolean };

export default function MobileControlDock() {
  const [state, setState] = useState<DockState>({ audio: false, helen: false });

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
    { key: 'helen', label: 'helen', Icon: Mic,          on: state.helen, accent: '#e040fb', ev: 'dock:helen' },
    { key: 'drop',  label: 'drop',  Icon: ChevronRight, on: false,       accent: '#00d4ff', ev: 'dock:deaddrop' },
    { key: 'logs',  label: 'logs',  Icon: ScrollText,   on: false,       accent: '#a8a29e', ev: 'dock:logs' },
  ] as const;

  return (
    <nav
      aria-label="system controls"
      className="sm:hidden fixed inset-x-0 z-[45] flex items-stretch justify-around border-t border-[#1f1c17] bg-[#0a0908]/95 backdrop-blur-md"
      style={{ bottom: 'calc(22px + env(safe-area-inset-bottom, 0px))' }}
    >
      {items.map(({ key, label, Icon, on, accent, ev }) => (
        <button
          key={key}
          type="button"
          onClick={fire(ev)}
          aria-pressed={on}
          aria-label={label}
          className="group flex flex-1 flex-col items-center justify-center gap-1 min-h-[52px] active:bg-white/[0.06] transition-colors"
          style={{ color: on ? accent : '#6b6660' }}
        >
          <Icon className="w-[19px] h-[19px]" strokeWidth={1.5} />
          <span className="text-[8.5px] tracking-[0.28em] uppercase leading-none">{label}</span>
          <span
            className="block h-[2px] w-4 rounded-full transition-all"
            style={{ background: on ? accent : 'transparent' }}
          />
        </button>
      ))}
    </nav>
  );
}
