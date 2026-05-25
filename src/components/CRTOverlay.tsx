export default function CRTOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[45]">
      <div
        className="absolute inset-0 crt-scanlines"
        style={{ animation: 'crt-flicker 4s infinite' }}
      />
      <div className="absolute inset-0 crt-vignette" />
    </div>
  );
}
