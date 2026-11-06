import { copy, events, site } from "@/content/series";
import { eventBySlug, unlessPlaceholder, untitledTitle } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = copy.shareImage.eventAlt;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

/** Splits a title into lines of about 14 characters for the image headline. */
function toLines(title: string): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > 16 && current) {
      lines.push(current);
      current = w;
    } else current = (current + " " + w).trim();
  }
  if (current) lines.push(current);
  if (lines.length <= 4) return lines;
  // Too long for the image: end on an ellipsis instead of stopping mid-sentence.
  const kept = lines.slice(0, 4);
  kept[3] = kept[3].replace(/[\s,;:.\-–]+$/, "") + "…";
  return kept;
}

/** An evening's share image: its title, and its label with the same rows as the hero and the event cards. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  // A title or venue still written as a [placeholder] is drawn as the site's "not announced yet" wording.
  const title = event ? unlessPlaceholder(event.display.title, untitledTitle(event.number)) : site.name;
  return renderOg({
    eyebrow: `${site.name} · ${event?.label ?? ""} · ${site.city}`,
    lines: toLines(title),
    labelLeft: site.name,
    labelRight: event?.label ?? "",
    labelTitle: event?.isTba ? copy.shareImage.detailsSoon : (event?.display.dateShort ?? ""),
    rows: [
      [copy.label.when, event?.display.date ?? copy.tba.date],
      [copy.label.where, unlessPlaceholder(event?.display.venue ?? copy.tba.venue, copy.tba.venue)],
      [copy.label.speaker, unlessPlaceholder(event?.display.speaker ?? copy.tba.long, copy.tba.long)],
      [copy.label.admission, copy.label.free],
    ],
  });
}
