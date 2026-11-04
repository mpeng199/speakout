import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";

export const OG_SIZE = { width: 1200, height: 630 };

const NIGHT = "#0e0f13";
const PAPER = "#ecebe7";
const AMBER = "#f0962a";

/**
 * Loads a static, subset TTF from the Google Fonts API at build time.
 * `stretch` picks the semi-expanded instance of Mona Sans to match the site.
 */
async function loadFont(family: string, spec: string, text: string, stretch?: string): Promise<ArrayBuffer> {
  "use cache";
  cacheLife("max");
  const url = `https://fonts.googleapis.com/css2?family=${family}:${spec}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "node" } })).text();
  const blocks = css.split("@font-face").slice(1);
  const block = (stretch ? blocks.find((b) => b.includes(`font-stretch: ${stretch}`)) : null) ?? blocks[0];
  const src = block?.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`Could not load font ${family}`);
  const res = await fetch(src[1]);
  return res.arrayBuffer();
}

/* Soft caustic strands, drawn as loose curves inside the light pool. */
const strands = [
  "M610 560 C 700 470, 820 520, 900 440 S 1060 330, 1200 370",
  "M580 630 C 690 580, 770 620, 870 560 S 1030 480, 1200 530",
  "M740 330 C 810 400, 900 360, 965 410 S 1070 500, 1200 470",
  "M690 460 C 770 410, 815 330, 905 315 S 1010 250, 1200 280",
  "M800 630 C 850 560, 945 580, 1000 520 S 1095 440, 1200 455",
  "M860 210 C 920 280, 1005 270, 1065 320 S 1140 400, 1200 390",
  "M930 630 C 950 560, 1030 545, 1060 480 S 1120 400, 1180 330",
  "M700 600 C 760 520, 880 600, 940 520 S 1000 420, 1090 380",
  "M1010 230 C 1000 300, 1070 330, 1060 400 S 1100 520, 1170 560",
];

export async function renderOg({
  eyebrow,
  lines,
  labelLeft,
  labelRight,
  labelTitle,
  rows,
}: {
  eyebrow: string;
  lines: string[];
  labelLeft: string;
  labelRight: string;
  labelTitle: string;
  rows: [string, string][];
}) {
  const displayText = [eyebrow, ...lines, labelLeft, labelRight, labelTitle, ...rows.map((r) => r[0])].join(" ").toUpperCase() +
    [eyebrow, ...lines, labelLeft, labelRight, labelTitle, ...rows.map((r) => r[0])].join(" ");
  const serifText = rows.map((r) => r[1]).join(" ");

  const [display500, display600, serif] = await Promise.all([
    loadFont("Mona+Sans", "wdth,wght@112.5,500", displayText, "semi-expanded"),
    loadFont("Mona+Sans", "wdth,wght@112.5,600", displayText, "semi-expanded"),
    loadFont("Source+Serif+4", "wght@400", serifText),
  ]);

  const headlineSize = lines.some((l) => l.length > 14) ? 76 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: NIGHT,
          color: PAPER,
          fontFamily: "Mona",
        }}
      >
        {/* Pool of amber light, built from soft shadows (no filters in the OG renderer) */}
        <div
          style={{
            position: "absolute",
            left: 860,
            top: 420,
            width: 220,
            height: 140,
            borderRadius: 140,
            background: "rgba(240,150,42,0.38)",
            boxShadow: "0 0 200px 150px rgba(240,150,42,0.26)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 470,
            width: 80,
            height: 50,
            borderRadius: 80,
            background: "rgba(255,211,145,0.35)",
            boxShadow: "0 0 90px 60px rgba(255,200,130,0.18)",
          }}
        />
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {strands.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i % 2 ? "#ffd391" : AMBER} strokeWidth={i % 3 === 0 ? 3 : 1.6} strokeOpacity={0.32 + (i % 3) * 0.16} />
          ))}
        </svg>

        <div style={{ position: "absolute", left: 64, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: AMBER }} />
          <div style={{ fontFamily: "Mona600", fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: PAPER }}>{eyebrow}</div>
        </div>

        <div style={{ position: "absolute", left: 60, top: 120, display: "flex", flexDirection: "column" }}>
          {lines.map((l) => (
            <div key={l} style={{ fontSize: headlineSize, lineHeight: 0.94, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
              {l}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 56,
            width: 450,
            display: "flex",
            flexDirection: "column",
            background: PAPER,
            color: NIGHT,
            borderRadius: 14,
            borderTop: `8px solid ${AMBER}`,
            padding: "20px 24px 18px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mona600", fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(14,15,19,0.6)" }}>
            <span>{labelLeft}</span>
            <span>{labelRight}</span>
          </div>
          <div style={{ fontSize: 30, letterSpacing: "-0.03em", marginTop: 8, marginBottom: 14 }}>{labelTitle}</div>
          {rows.map(([term, detail], i) => (
            <div
              key={term}
              style={{
                display: "flex",
                gap: 16,
                padding: "9px 0",
                borderTop: i === 0 ? "1px solid rgba(14,15,19,0.16)" : "none",
                borderBottom: "1px solid rgba(14,15,19,0.14)",
              }}
            >
              <div style={{ width: 104, flexShrink: 0, fontFamily: "Mona600", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(14,15,19,0.6)", paddingTop: 3 }}>{term}</div>
              <div style={{ display: "flex", flex: 1, fontFamily: "Serif", fontSize: 18 }}>{detail}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Mona", data: display500, weight: 500, style: "normal" },
        { name: "Mona600", data: display600, weight: 600, style: "normal" },
        { name: "Serif", data: serif, weight: 400, style: "normal" },
      ],
    },
  );
}
