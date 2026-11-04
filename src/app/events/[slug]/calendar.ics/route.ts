import { events, site } from "@/content/series";
import { calendarDetails, calendarStamp as stamp, eventBySlug, siteUrl } from "@/lib/content";

export async function generateStaticParams() {
  return events.filter((e) => e.start).map((e) => ({ slug: e.slug }));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** An .ics file so people can add an evening to their calendar. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event || event.startTs === null || event.endTs === null) {
    return new Response("This event does not have a date yet.", { status: 404 });
  }
  const url = `${siteUrl()}/events/${event.slug}`;
  const { title, description, location } = calendarDetails(event);
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
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(location)}`,
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
