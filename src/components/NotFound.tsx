import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { verseLine } from '../lib/verseLines';

// Lost in the archive. A wrong path gets one true line and a way home.
export default function NotFound() {
  const line = useMemo(verseLine, []);
  return (
    <main className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#00d4ff]/80">
        — lost in the archive · 404
      </div>
      <p className="font-serif text-xl md:text-2xl text-[#d6cfc3] max-w-md leading-relaxed">
        {line}
      </p>
      <p className="font-mono text-[13px] text-[#8a837a] max-w-md leading-relaxed">
        you found a road that isn&rsquo;t on the map.
        <br />
        neither was chiclayo, some years.
      </p>
      <Link
        to="/"
        className="min-h-[44px] inline-flex items-center font-mono text-sm text-[#e040fb] border border-[#e040fb]/50 px-5 hover:bg-[#e040fb] hover:text-[#07070a] transition-colors"
      >
        cd ~
      </Link>
    </main>
  );
}
