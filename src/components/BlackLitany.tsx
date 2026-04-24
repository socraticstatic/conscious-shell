const LITANY = [
  'memento mori',
  'lux aeterna',
  'nox est perpetua una dormienda',
  'more human than human',
  'in rosarium mortis',
  'sic transit gloria mundi',
  'tempus edax rerum',
  'ars longa vita brevis',
  'all those moments · lost in time',
  'the owl was artificial, wasn\'t it?',
  'dies iræ · dies illa',
  'requiem æternam dona eis',
  'a forest · marian · marlene',
  'fade to grey',
  'she hangs the roses at dusk',
  'umbra sumus',
];

export default function BlackLitany() {
  const loop = [...LITANY, ...LITANY];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 bottom-0 z-[5] overflow-hidden border-t border-[#1f1c17] bg-[#050304]/70 backdrop-blur-[1px]"
      style={{ height: 22 }}
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
            <span className="w-1 h-1 bg-[#ff7a5c]/60 mr-3" />
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
