import { events, site } from "@/content/series";
import { eventBySlug } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = `An evening at ${site.name}, free talks on medicine in New York City`;
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
  return lines.slice(0, 4);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  const title = event?.display.title ?? site.name;
  return renderOg({
    eyebrow: `${site.name} · ${event?.label ?? ""} · ${site.city}`,
    lines: toLines(title),
    labelLeft: site.name,
    labelRight: event?.label ?? "",
    labelTitle: event?.isTba ? "Details soon" : (event?.display.dateShort ?? ""),
    rows: [
      ["When", event?.isTba ? "Date TBA" : `${event?.display.date}`],
      ["Where", event?.venue?.name ?? `Venue TBA, ${site.city}`],
      ["Speaker", event?.display.speaker ?? "To be announced"],
    ],
  });
}
