import { events, site } from "@/content/series";
import { eventBySlug, siteUrl } from "@/lib/content";

export async function generateStaticParams() {
  return events.filter((e) => e.start).map((e) => ({ slug: e.slug }));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const stamp = (ts: number) => new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** An .ics file so people can add an evening to their calendar. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event || event.startTs === null || event.endTs === null) {
    return new Response("This event does not have a date yet.", { status: 404 });
  }
  const url = `${siteUrl()}/events/${event.slug}`;
  const where = event.venue ? `${event.venue.name}, ${event.venue.address}` : site.city;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Events//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@${new URL(siteUrl()).host}`,
    `DTSTAMP:${stamp(event.startTs)}`,
    `DTSTART:${stamp(event.startTs)}`,
    `DTEND:${stamp(event.endTs)}`,
    `SUMMARY:${esc(`${site.name} ${event.label}: ${event.display.title}`)}`,
    `DESCRIPTION:${esc(`${event.summary ?? "A free evening talk on medicine."} ${url}`)}`,
    `LOCATION:${esc(where)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.name.toLowerCase()}-${event.slug}.ics"`,
    },
  });
}
