import { useEffect, useRef, useState } from 'react';
import { Headphones, VolumeX } from 'lucide-react';

/**
 * Two-layer ambient bed (rain + distant city), gently crossfaded in/out.
 *
 * Deliberately NOT routed through Web Audio. iOS Safari ignores `loop` on an
 * element connected to a MediaElementAudioSourceNode and is unreliable about
 * AudioContext.close(), which broke both looping and the off-toggle on iOS.
 * Plain <audio loop> elements loop reliably and pause() always silences them,
 * so we mix with element .volume and animate the fade by hand.
 */
type State = {
  rain: HTMLAudioElement;
  city: HTMLAudioElement;
  m: number; // master 0..1, animated
  raf: number;
};

// Per-layer volume at full master. Preserves the old rain-forward mix
// (master 0.6 × rain 0.75 / city 0.2).
const RAIN_VOL = 0.45;
const CITY_VOL = 0.12;
const FADE_IN_MS = 2500;
const FADE_OUT_MS = 1200;

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const state = useRef<State | null>(null);

  const fade = (to: number, durMs: number) => {
    const s = state.current;
    if (!s) return;
    cancelAnimationFrame(s.raf);
    const from = s.m;
    const startTime = performance.now();
    const tick = (now: number) => {
      const cur = state.current;
      if (!cur) return;
      const t = durMs <= 0 ? 1 : Math.min(1, (now - startTime) / durMs);
      cur.m = from + (to - from) * t;
      cur.rain.volume = Math.max(0, Math.min(1, RAIN_VOL * cur.m));
      cur.city.volume = Math.max(0, Math.min(1, CITY_VOL * cur.m));
      if (t < 1) {
        cur.raf = requestAnimationFrame(tick);
      } else if (to === 0) {
        try { cur.rain.pause(); cur.city.pause(); } catch { /* ignore */ }
        state.current = null;
      }
    };
    s.raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (state.current) return;

    const rain = new Audio('/audio/rain.mp3');
    rain.loop = true;
    rain.preload = 'auto';
    rain.volume = 0;

    const city = new Audio('/audio/city.mp3');
    city.loop = true;
    city.preload = 'auto';
    city.volume = 0;

    // Belt-and-suspenders for any engine that drops `loop`: restart on end.
    const reloop = (el: HTMLAudioElement) => () => {
      try { el.currentTime = 0; void el.play(); } catch { /* ignore */ }
    };
    rain.addEventListener('ended', reloop(rain));
    city.addEventListener('ended', reloop(city));

    // Kick playback synchronously inside the user gesture — iOS revokes the
    // activation across any await, so do not await anything before this.
    void rain.play();
    void city.play();

    state.current = { rain, city, m: 0, raf: 0 };
    fade(1, FADE_IN_MS);
  };

  const stop = () => {
    if (!state.current) return;
    fade(0, FADE_OUT_MS);
  };

  // Immediate teardown on unmount (no fade).
  useEffect(() => () => {
    const s = state.current;
    if (!s) return;
    cancelAnimationFrame(s.raf);
    try { s.rain.pause(); s.city.pause(); } catch { /* ignore */ }
    state.current = null;
  }, []);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  // Mobile dock integration: respond to the dock's toggle and report state back.
  useEffect(() => {
    const onDock = () => { toggle(); };
    window.addEventListener('dock:audio', onDock);
    return () => window.removeEventListener('dock:audio', onDock);
  });

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dock:state', { detail: { control: 'audio', active: on } }));
  }, [on]);

  const Icon = on ? Headphones : VolumeX;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? 'silence ambient' : 'enable ambient'}
      className={`pointer-events-auto fixed left-4 md:left-6 bottom-28 md:bottom-32 max-sm:hidden z-40 inline-flex items-center gap-2 border px-3 py-2 text-[10px] tracking-[0.3em] uppercase transition-colors ${
        on
          ? 'border-[#00d4ff]/60 text-[#00d4ff] bg-[#0b0a08]/80'
          : 'border-[#1f1c17] text-[#6b6660] bg-[#0b0a08]/60 hover:border-[#00d4ff]/40 hover:text-[#00d4ff]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {on ? 'amb · on' : 'amb · off'}
    </button>
  );
}
