/**
 * A still of the amber light, drawn in vector so it costs no image request.
 * It sits under the live shader, shows on its own when WebGL is off or slow,
 * and is what people with reduced motion see.
 */
const strands = [
  "M560 1040 C 700 900, 860 960, 980 860 S 1240 700, 1660 760",
  "M500 1120 C 680 1050, 800 1110, 960 1010 S 1240 880, 1660 960",
  "M760 580 C 870 700, 1010 640, 1110 720 S 1290 880, 1660 820",
  "M680 820 C 800 740, 880 610, 1020 590 S 1210 480, 1660 520",
  "M840 1120 C 920 1000, 1060 1030, 1150 930 S 1310 800, 1660 820",
  "M940 380 C 1040 500, 1170 480, 1270 560 S 1420 700, 1660 680",
  "M1080 1120 C 1110 1000, 1240 980, 1290 870 S 1390 730, 1520 600",
  "M700 1080 C 800 940, 990 1080, 1090 940 S 1190 760, 1350 700",
  "M1180 420 C 1170 540, 1280 590, 1270 710 S 1330 920, 1460 990",
  "M620 700 C 720 640, 760 560, 860 520 S 980 440, 1100 470",
];

export function AmberStill({ align = "right" }: { align?: "right" | "center" }) {
  return (
    <svg
      className="amber-still"
      viewBox="0 0 1600 1000"
      preserveAspectRatio={align === "right" ? "xMaxYMax slice" : "xMidYMid slice"}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`amber-pool-${align}`} cx={align === "right" ? "0.74" : "0.6"} cy="0.7" r="0.62">
          <stop offset="0" stopColor="#f0962a" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="#f0962a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#f0962a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`amber-core-${align}`} cx={align === "right" ? "0.76" : "0.62"} cy="0.72" r="0.22">
          <stop offset="0" stopColor="#ffd391" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffd391" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#amber-pool-${align})`} />
      <rect width="1600" height="1000" fill={`url(#amber-core-${align})`} />
      <g fill="none" strokeLinecap="round" transform={align === "center" ? "translate(-260 -60)" : undefined}>
        {strands.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#f0962a" strokeOpacity={0.1} strokeWidth={10} />
            <path d={d} stroke={i % 2 ? "#ffd391" : "#f0962a"} strokeOpacity={0.3 + (i % 3) * 0.12} strokeWidth={i % 3 === 0 ? 2.4 : 1.4} />
          </g>
        ))}
      </g>
    </svg>
  );
}
