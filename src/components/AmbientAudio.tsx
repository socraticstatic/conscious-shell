import { useEffect, useRef, useState } from 'react';
import { Headphones, VolumeX } from 'lucide-react';

type Nodes = {
  ctx: AudioContext;
  master: GainNode;
  droneA: OscillatorNode;
  droneB: OscillatorNode;
  droneC: OscillatorNode;
  droneGain: GainNode;
  noise: AudioBufferSourceNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

function makeNoiseBuffer(ctx: AudioContext) {
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  return buffer;
}

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const nodes = useRef<Nodes | null>(null);

  const start = async () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.12;
    droneGain.connect(master);

    const mkOsc = (freq: number, type: OscillatorType) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.connect(droneGain);
      o.start();
      return o;
    };

    const droneA = mkOsc(55, 'sine');
    const droneB = mkOsc(82.4, 'triangle');
    const droneC = mkOsc(110, 'sine');

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(droneA.frequency);
    lfo.start();

    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1800;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.18;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();

    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2);

    nodes.current = {
      ctx, master, droneA, droneB, droneC, droneGain,
      noise, noiseFilter, noiseGain, lfo, lfoGain,
    };
  };

  const stop = () => {
    const n = nodes.current;
    if (!n) return;
    const { ctx, master, droneA, droneB, droneC, noise, lfo } = n;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);
    setTimeout(() => {
      try {
        droneA.stop();
        droneB.stop();
        droneC.stop();
        lfo.stop();
        noise.stop();
        ctx.close();
      } catch {}
      nodes.current = null;
    }, 1600);
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
      className={`pointer-events-auto fixed left-4 md:left-6 bottom-28 md:bottom-32 z-40 inline-flex items-center gap-2 border px-3 py-2 text-[10px] tracking-[0.3em] uppercase transition-colors ${
        on
          ? 'border-[#5ec8d8]/60 text-[#5ec8d8] bg-[#0b0a08]/80'
          : 'border-[#1f1c17] text-[#6b6660] bg-[#0b0a08]/60 hover:border-[#5ec8d8]/40 hover:text-[#5ec8d8]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {on ? 'amb · on' : 'amb · off'}
    </button>
  );
}
