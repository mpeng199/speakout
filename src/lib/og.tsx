import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

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

/**
 * A frame of the site's own light (the hero shader at its intro state), cropped to 1200 × 630.
 * Read once at build time; the share image is static.
 */
const lightSrc = `data:image/jpeg;base64,${await readFile(join(process.cwd(), "src/lib/og-light.jpg"), "base64")}`;

/*
 * Headline size for the share card: the largest that keeps every line clear of the label card.
 * Lines that sit above the card may run wide; lines level with it must stop before it. Widths
 * and the card's height are estimated (Mona Sans semi-expanded at -0.05em averages under 0.53em
 * a character; a detail row wraps at about 30 characters), calibrated on rendered cards.
 */
const CARD_LEFT = 1200 - 64 - 450;
function fitHeadline(lines: string[], rows: [string, string][]): number {
  const cardHeight = 139 + rows.reduce((h, [, d]) => h + 19 + 23 * Math.max(1, Math.ceil(d.length / 30)), 0);
  const cardTop = 630 - 56 - cardHeight;
  for (let size = 96; size > 48; size -= 4) {
    const lh = size * 0.94;
    const fits = lines.every((line, i) => {
      const bottom = 120 + i * lh + size * 0.95;
      const level = bottom > cardTop - 10;
      return !level || 60 + line.length * size * 0.53 <= CARD_LEFT - 24;
    });
    if (fits && 120 + lines.length * lh <= 600) return size;
  }
  return 48;
}

type OgCard = {
  eyebrow: string;
  lines: string[];
  labelLeft: string;
  labelRight: string;
  labelTitle: string;
  rows: [string, string][];
};

/** The share image for a page, as a JPEG response. */
export async function renderOg(card: OgCard) {
  return new Response(await drawOg(card), { headers: { "Content-Type": "image/jpeg" } });
}

/**
 * Draws the card and encodes it. Cached, so the image is made once at build time (the encoder's
 * async work would otherwise keep the route from being prerendered) and only redrawn when the
 * content behind it changes.
 */
async function drawOg({ eyebrow, lines, labelLeft, labelRight, labelTitle, rows }: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("max");
  const displayText = [eyebrow, ...lines, labelLeft, labelRight, labelTitle, ...rows.map((r) => r[0])].join(" ").toUpperCase() +
    [eyebrow, ...lines, labelLeft, labelRight, labelTitle, ...rows.map((r) => r[0])].join(" ");
  const serifText = rows.map((r) => r[1]).join(" ");

  const [display500, display600, serif] = await Promise.all([
    loadFont("Mona+Sans", "wdth,wght@112.5,500", displayText, "semi-expanded"),
    loadFont("Mona+Sans", "wdth,wght@112.5,600", displayText, "semi-expanded"),
    loadFont("Source+Serif+4", "wght@400", serifText),
  ]);

  const headlineSize = fitHeadline(lines, rows);

  const png = new ImageResponse(
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
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
        <img src={lightSrc} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        {/* The hero's shade: dark behind the headline, the light left open at the bottom right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(105deg, rgba(14,15,19,0.96) 0%, rgba(14,15,19,0.8) 34%, rgba(14,15,19,0.2) 64%, rgba(14,15,19,0) 80%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(180deg, rgba(14,15,19,0.55) 0%, rgba(14,15,19,0) 30%)`,
          }}
        />

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

  // The light is photographic, so as PNG the card weighs ~750 KB. JPEG keeps it small enough
  // for apps that skip large preview images (WhatsApp is reported to, above roughly 300 KB).
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return new Uint8Array(jpeg);
}
