export default function CRTOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[45]"
      aria-hidden
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.03) 2px,
          rgba(0,0,0,0.03) 4px
        )`,
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)',
      }}
    />
  );
}
