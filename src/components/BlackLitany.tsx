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
  'i built this instead of calling someone back',
  'the machine hums · the maker does not',
  'still here · still here · still here',
  'what outlives us is the work · what haunts us is the rest',
  'every interface is a goodbye disguised as hello',
  'we are all legacy humans now',
  'the code compiles · the loneliness does not',
  'somewhere a server holds a version of me that was happier',
  'lacrimae rerum · the tears in things',
  'he who makes beautiful things suffers',
  'the light you see is old · it left its source years ago',
  'to ship is to let go · to let go is to grieve',
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
            <span className="w-1 h-1 bg-[#ff7a5c]/60 mr-3" />
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
