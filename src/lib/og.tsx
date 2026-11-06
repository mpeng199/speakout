import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { copy } from "@/content/series";
import { unlessPlaceholder } from "@/lib/content";

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
 * Text widths on the card, in em, measured on rendered cards: Mona Sans semi-expanded 500 at the
 * headline's -0.05em letter spacing, and Source Serif 4 for the label rows. Each character counts
 * as the widest of its group, so an estimate is never narrower than the text; anything not listed
 * counts as a wide letter.
 */
function widths(groups: [number, string][], other: number): (text: string) => number {
  const em = new Map<string, number>();
  for (const [w, chars] of groups) for (const c of chars) em.set(c, w);
  return (text) => [...text].reduce((sum, c) => sum + (em.get(c) ?? other), 0);
}
const sansEm = widths([[0.2, " !',.:;ijl·’"], [0.35, "\"()-/1Ifrt“”"], [0.5, "Jsz–"], [0.6, "2357?FLTabcdeghknopquvxy…"], [0.7, "04689BEKPRSXYZ—"], [0.8, "&ACDGHNOUVw"], [1, "MQWm"]], 0.8);
const serifEm = widths([[0.25, " '’"], [0.35, "!,-./:;ijl·"], [0.45, "\"()?IJft“”"], [0.55, "0123456789Sacersz–"], [0.65, "EFLPTZbdghknopquvxy"], [0.75, "&ABCDGKOQRVXY"], [0.85, "HNUw—…"], [1.01, "MWm"]], 0.85);
/** The label title is the headline's face at -0.03em, so 0.02em wider a character. */
const titleEm = (t: string) => sansEm(t) + 0.02 * [...t].length;

/** How many lines a text takes in a box `width` px wide, breaking only between words. */
function lineCount(text: string, width: number, size: number, em: (t: string) => number): number {
  const linesFor = (t: string) => Math.max(1, Math.ceil((em(t) * size) / width));
  let lines = 0;
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && em(`${line} ${word}`) * size > width) {
      lines += linesFor(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  return lines + linesFor(line);
}

/*
 * The label card's height, measured on rendered cards: 89 px of strip and padding, 42 px a line of
 * title (30 px type, 402 px wide), and for each row 19 px plus 25 px a line of detail (18 px serif,
 * 282 px beside the term).
 */
function cardHeight(labelTitle: string, rows: [string, string][]): number {
  return 89 + 42 * lineCount(labelTitle, 402, 30, titleEm) + rows.reduce((h, [, d]) => h + 19 + 25 * lineCount(d, 282, 18, serifEm), 0);
}

/*
 * Headline size for the share card: the largest that keeps every line clear of the label card.
 * Lines that sit above the card may run wide, up to the image's margin; lines level with it (their
 * descenders reach about 1.02em below the line's top) must stop 24 px before it.
 */
const CARD_LEFT = 1200 - 64 - 450;
function fitHeadline(lines: string[], labelTitle: string, rows: [string, string][]): number {
  const cardTop = 630 - 56 - cardHeight(labelTitle, rows);
  for (let size = 96; size > 48; size -= 4) {
    const lh = size * 0.94;
    const fits = lines.every((line, i) => {
      const level = 120 + i * lh + size * 1.03 > cardTop - 10;
      return 60 + sansEm(line) * size <= (level ? CARD_LEFT - 24 : 1200 - 64);
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

/**
 * The share image for a page, as a JPEG response. The image can't underline a [placeholder] the way
 * the site does, so any text that still has one is drawn as "To be announced" (callers pass the
 * wording that fits first; this is the last guard).
 */
export async function renderOg(card: OgCard) {
  const clean = (t: string) => unlessPlaceholder(t, copy.tba.long);
  const drawn: OgCard = {
    eyebrow: clean(card.eyebrow),
    lines: card.lines.map(clean),
    labelLeft: clean(card.labelLeft),
    labelRight: clean(card.labelRight),
    labelTitle: clean(card.labelTitle),
    rows: card.rows.map(([term, detail]) => [clean(term), clean(detail)]),
  };
  return new Response(await drawOg(drawn), { headers: { "Content-Type": "image/jpeg" } });
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

  const headlineSize = fitHeadline(lines, labelTitle, rows);

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
