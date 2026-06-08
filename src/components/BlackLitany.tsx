const LITANY = [
  'thirty years of making things people love',
  'research → insight → design → ship · repeat',
  'good design is invisible · great design is remembered',
  'still shipping · still curious · still here',
  'built with care · tested with empathy',
  '126 projects · every one a story',
  'the best work starts with listening',
  'dallas · 2049 · fully operational',
  'designed for humans · by a human',
  'conscious_shell · active · aligned · caffeinated',
  'make it clear · make it fast · make it beautiful',
  'design leads · strategy follows · users win',
  'from lima to dallas · thirty years in motion',
  'tyrell.shell v4.7 · all systems go',
  'the interface is the product · make it sing',
  'more human than human · always',
  'shipped 126 times · zero regrets',
  'research first · pixels second · launch third',
  'great ux is just respect at scale',
  'the cursor blinks · the work continues',
  'impact measured · users delighted · mission on',
  'design leadership · 30 years strong',
  'every pixel earned · every decision intentional',
  'the best products feel inevitable in hindsight',
  'currently: open to select engagements',
  'coffee hot · ideas hotter · code shipping',
];

export default function BlackLitany() {
  const loop = [...LITANY, ...LITANY];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 z-[5] overflow-hidden border-t border-[#1f1c17] bg-[#050304]/70 backdrop-blur-[1px]"
      style={{ height: 22, bottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-[10px] tracking-[0.35em] uppercase text-[#6b6660]"
        style={{
          animation: 'litany-scroll 90s linear infinite',
          willChange: 'transform',
          textShadow: '0 0 6px rgba(255,108,72,0.15)',
        }}
      >
        {loop.map((line, i) => (
          <span key={i} className="inline-flex items-center px-8">
            <span className="w-1 h-1 bg-[#ff006e]/60 mr-3" />
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
