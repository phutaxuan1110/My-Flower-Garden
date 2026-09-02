export function GardenBackdrop() {
  return (
    <svg
      viewBox="0 0 400 520"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9FB" />
          <stop offset="100%" stopColor="#FBE7EC" />
        </linearGradient>
        <linearGradient id="grassFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C3D4BC" />
          <stop offset="100%" stopColor="#A8BEA2" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="520" fill="url(#skyFade)" />

      {/* rolling ground */}
      <path
        d="M0 340 C 60 300, 140 300, 200 330 C 260 360, 330 300, 400 320 L400 520 L0 520 Z"
        fill="url(#grassFade)"
        opacity="0.55"
      />
      <path
        d="M0 400 C 80 370, 160 420, 230 390 C 300 360, 350 410, 400 390 L400 520 L0 520 Z"
        fill="#A8BEA2"
        opacity="0.5"
      />

      {/* scattered botanical dots */}
      {[
        [40, 360], [90, 420], [150, 460], [210, 400], [260, 450], [320, 380], [360, 440], [30, 470],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 3 : 2} fill="#D97891" opacity="0.35" />
      ))}

      {/* soft vine curls */}
      <path
        d="M20 250 C 40 230, 40 210, 20 190"
        stroke="#A8BEA2"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M380 260 C 360 240, 360 215, 385 195"
        stroke="#A8BEA2"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
