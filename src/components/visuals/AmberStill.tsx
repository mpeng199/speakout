/**
 * A still of the amber light: a soft pool with a warm core, drawn in vector so
 * it costs no image request. It sits under the live shader, shows on its own
 * when WebGL is off or slow, and is what people with reduced motion see.
 */
export function AmberStill({ align = "right" }: { align?: "right" | "center" }) {
  const right = align === "right";
  const id = `amber-${align}`;
  return (
    <svg
      className="amber-still"
      viewBox="0 0 1600 1000"
      preserveAspectRatio={right ? "xMaxYMax slice" : "xMidYMid slice"}
      aria-hidden="true"
      focusable="false"
      overflow="hidden"
    >
      <defs>
        <radialGradient id={`${id}-pool`} cx={right ? 1180 : 960} cy={right ? 700 : 560} r="760" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${right ? 1180 : 960} ${right ? 700 : 560}) scale(1.25 0.8) translate(${right ? -1180 : -960} ${right ? -700 : -560})`}>
          <stop offset="0" stopColor="#f0962a" stopOpacity="0.36" />
          <stop offset="0.35" stopColor="#f0962a" stopOpacity="0.16" />
          <stop offset="0.7" stopColor="#f0962a" stopOpacity="0.04" />
          <stop offset="1" stopColor="#f0962a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-core`} cx={right ? 1230 : 1000} cy={right ? 740 : 590} r="300" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${right ? 1230 : 1000} ${right ? 740 : 590}) scale(1.4 0.7) translate(${right ? -1230 : -1000} ${right ? -740 : -590})`}>
          <stop offset="0" stopColor="#ffd391" stopOpacity="0.34" />
          <stop offset="0.5" stopColor="#f0962a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#f0962a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glint`} cx={right ? 1050 : 820} cy={right ? 610 : 470} r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd391" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffd391" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Oversized fills so the glow can be scaled (lighting cues) without showing an edge */}
      <g className="amber-still-glow" data-cx={right ? 1180 : 960} data-cy={right ? 700 : 560}>
        <rect x="-1600" y="-1000" width="4800" height="3000" fill={`url(#${id}-pool)`} />
        <rect x="-1600" y="-1000" width="4800" height="3000" fill={`url(#${id}-core)`} />
        <rect x="-1600" y="-1000" width="4800" height="3000" fill={`url(#${id}-glint)`} />
      </g>
    </svg>
  );
}
