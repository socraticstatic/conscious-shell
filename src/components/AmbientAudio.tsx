import { useEffect, useRef, useState } from 'react';
import { Headphones, VolumeX } from 'lucide-react';

type State = {
  ctx: AudioContext;
  master: GainNode;
  rain: HTMLAudioElement;
  city: HTMLAudioElement;
  rainNode: MediaElementAudioSourceNode;
  cityNode: MediaElementAudioSourceNode;
  rainGain: GainNode;
  cityGain: GainNode;
};

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const state = useRef<State | null>(null);

  const start = async () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const rain = new Audio('/audio/rain.mp3');
    rain.loop = true;
    rain.crossOrigin = 'anonymous';

    const city = new Audio('/audio/city.mp3');
    city.loop = true;
    city.crossOrigin = 'anonymous';

    const rainNode = ctx.createMediaElementSource(rain);
    const cityNode = ctx.createMediaElementSource(city);

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.75;
    rainNode.connect(rainGain);
    rainGain.connect(master);

    const cityGain = ctx.createGain();
    cityGain.gain.value = 0.2;
    cityNode.connect(cityGain);
    cityGain.connect(master);

    await Promise.all([rain.play(), city.play()]);

    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2.5);

    state.current = { ctx, master, rain, city, rainNode, cityNode, rainGain, cityGain };
  };

  const stop = () => {
    const s = state.current;
    if (!s) return;
    const { ctx, master, rain, city } = s;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    setTimeout(() => {
      try {
        rain.pause();
        city.pause();
        ctx.close();
      } catch {}
      state.current = null;
    }, 1400);
  };

  useEffect(() => () => { stop(); }, []);

  const toggle = async () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      await start();
      setOn(true);
    }
  };

  const Icon = on ? Headphones : VolumeX;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? 'silence ambient' : 'enable ambient'}
      className={`pointer-events-auto fixed left-4 md:left-6 bottom-28 md:bottom-32 max-sm:left-3 max-sm:bottom-8 max-sm:min-h-[44px] z-40 inline-flex items-center gap-2 border px-3 py-2 max-sm:py-2.5 text-[10px] tracking-[0.3em] uppercase transition-colors ${
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
