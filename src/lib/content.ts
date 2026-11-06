import { cacheLife } from "next/cache";
import { copy, events, site, speakers, type SeriesEvent, type Speaker } from "@/content/series";

export const TIME_ZONE = "America/New_York";

/** A value written as "[Something]" in the content file still needs real info. */
export function isPlaceholder(value: string | null | undefined): boolean {
  return typeof value === "string" && /^\s*\[.*\]\s*$/.test(value);
}

/** The text still has a [placeholder] somewhere in it, on its own or inside a sentence. */
export function hasPlaceholder(value: string | null | undefined): boolean {
  return typeof value === "string" && /\[[^\]]+\]/.test(value);
}

/** The text, or `fallback` while it still has a [placeholder] (for the share images, which can't underline one). */
export function unlessPlaceholder(value: string, fallback: string): string {
  return hasPlaceholder(value) ? fallback : value;
}

/** "[Month Year]" → "Month Year" */
export function stripBrackets(value: string): string {
  return value.replace(/^\s*\[/, "").replace(/\]\s*$/, "");
}

/** Usable value: not empty and not a placeholder. */
export function isSet(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "" && !isPlaceholder(value);
}

export function siteUrl(): string {
  if (isSet(site.url)) return site.url.replace(/\/$/, "");
  // On Vercel: previews point at their own address, production at the project domain.
  const vercel =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Puts values into a line from the content file: fill("Doors {time}", { time: "6 pm" }) → "Doors 6 pm". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => (key in values ? String(values[key]) : token));
}

export function labelNumber(n: number): string {
  return `${copy.label.number} ${String(n).padStart(3, "0")}`;
}

/** What an evening is called until it has a title: "First evening", "Evening No. 002". */
export function untitledTitle(n: number): string {
  return n === 1 ? copy.untitled.first : fill(copy.untitled.numbered, { number: labelNumber(n) });
}

/* ───────────────────────────── Dates in New York time ───────────────────────────── */

function tzOffsetMinutes(date: Date, timeZone = TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUtc - date.getTime()) / 60000;
}

/** "2027-03-11T19:00" in New York time → UTC timestamp (ms). */
export function nyLocalToTimestamp(local: string): number {
  const [d, t = "00:00"] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, day, hh, mm);
  const first = tzOffsetMinutes(new Date(guess));
  let ts = guess - first * 60000;
  const second = tzOffsetMinutes(new Date(ts));
  if (second !== first) ts = guess - second * 60000;
  return ts;
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...opts });

export function formatTime(ts: number): string {
  const parts = fmt({ hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(ts));
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "").toLowerCase();
  return minute === "00" ? `${hour} ${period}` : `${hour}:${minute} ${period}`;
}

export function formatDateLong(ts: number): string {
  return fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(ts));
}

export function formatDateMedium(ts: number): string {
  return fmt({ weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(ts));
}

export function formatDateShort(ts: number): string {
  return fmt({ weekday: "short", month: "short", day: "numeric" }).format(new Date(ts));
}

export function formatMonthYear(ts: number): string {
  return fmt({ month: "long", year: "numeric" }).format(new Date(ts));
}

export function formatDay(ts: number): { weekday: string; day: string; month: string } {
  return {
    weekday: fmt({ weekday: "short" }).format(new Date(ts)),
    day: fmt({ day: "numeric" }).format(new Date(ts)),
    month: fmt({ month: "short" }).format(new Date(ts)),
  };
}

/** "HH:MM" on the same day as the event → timestamp */
function sameDayTime(start: string, hhmm: string): number {
  return nyLocalToTimestamp(`${start.split("T")[0]}T${hhmm}`);
}

/* ───────────────────────────── Speakers & events ───────────────────────────── */

export function confirmedSpeakers(): Speaker[] {
  return speakers.filter((s) => s.confirmed);
}

export function confirmedSpeaker(id: string | null): Speaker | null {
  if (!id) return null;
  return speakers.find((s) => s.id === id && s.confirmed) ?? null;
}

export type EventView = SeriesEvent & {
  label: string;
  startTs: number | null;
  endTs: number | null;
  doorsTs: number | null;
  speaker: Speaker | null;
  isTba: boolean;
  /** Human strings, already formatted in New York time */
  display: {
    title: string;
    date: string;
    dateMedium: string;
    dateShort: string;
    time: string;
    doors: string | null;
    /** When the evening finishes, e.g. "8:15 pm" */
    end: string | null;
    venue: string;
    address: string | null;
    speaker: string;
  };
};

export function toEventView(e: SeriesEvent): EventView {
  const startTs = e.start ? nyLocalToTimestamp(e.start) : null;
  const endTs = startTs !== null ? startTs + e.durationMinutes * 60000 : null;
  const doorsTs = e.start && e.doorsOpen ? sameDayTime(e.start, e.doorsOpen) : null;
  const speaker = confirmedSpeaker(e.speakerId);
  const isTba = startTs === null;
  return {
    ...e,
    label: labelNumber(e.number),
    startTs,
    endTs,
    doorsTs,
    speaker,
    isTba,
    display: {
      title: e.title ?? untitledTitle(e.number),
      date: startTs !== null ? formatDateLong(startTs) : copy.tba.date,
      dateMedium: startTs !== null ? formatDateMedium(startTs) : copy.tba.date,
      dateShort: startTs !== null ? formatDateShort(startTs) : copy.tba.short,
      time: startTs !== null ? formatTime(startTs) : copy.tba.time,
      doors: doorsTs !== null ? formatTime(doorsTs) : null,
      end: endTs !== null ? formatTime(endTs) : null,
      venue: e.venue?.name ?? copy.tba.venue,
      address: e.venue?.address ?? null,
      speaker: speaker ? speaker.name : copy.tba.long,
    },
  };
}

export function allEvents(): EventView[] {
  return events.map(toEventView);
}

export function eventBySlug(slug: string): EventView | null {
  const e = events.find((x) => x.slug === slug);
  return e ? toEventView(e) : null;
}

/**
 * Which events are upcoming depends on today's date, so this is cached and
 * refreshed every hour. The page itself stays prerendered.
 */
export async function getSchedule() {
  "use cache";
  cacheLife("hours");
  const now = Date.now();
  const views = allEvents();
  const isUpcoming = (e: EventView) => e.endTs === null || e.endTs > now;
  const upcoming = views
    .filter(isUpcoming)
    .sort((a, b) => (a.startTs ?? Number.MAX_SAFE_INTEGER) - (b.startTs ?? Number.MAX_SAFE_INTEGER));
  const past = views.filter((e) => !isUpcoming(e)).sort((a, b) => (b.startTs ?? 0) - (a.startTs ?? 0));
  const next = upcoming.find((e) => e.startTs !== null) ?? null;
  return { upcoming, past, next };
}

/**
 * The label in the hero, which the home page's share image repeats: the next evening with a date,
 * else the first upcoming one, else a blank label for the next number in the series.
 */
export async function heroLabel() {
  const { next, upcoming, past } = await getSchedule();
  const featured = next ?? upcoming[0] ?? null;
  // With nothing upcoming, the label points at the next number in the series.
  const nextNumber = Math.max(0, ...upcoming.map((e) => e.number), ...past.map((e) => e.number)) + 1;
  const isFirst = !past.length && (!featured || featured.number === 1);
  // Until any evening has a date, the first one can show its month (site.firstEventLabel).
  const firstEvent = !next && isFirst && site.firstEventLabel.trim() ? site.firstEventLabel : null;
  return {
    /** The evening the label opens, if there is one. */
    featured,
    /** The evening whose date and venue it shows, once one has a date. */
    next,
    firstEvent,
    number: featured ? featured.label : labelNumber(nextNumber),
    title: featured ? featured.display.title : isFirst ? copy.untitled.first : copy.untitled.next,
    /** The rows as plain text; the hero adds "· tonight" and the like next to the date in the browser. */
    when: next ? `${next.display.dateShort}, ${next.display.time}` : firstEvent ? `${copy.hero.firstEvent} ${firstEvent}` : copy.tba.long,
    where: next?.venue ? next.venue.name : site.city,
    speaker: featured ? featured.display.speaker : copy.tba.long,
    admission: copy.label.free,
  };
}

/* ───────────── Calendars ───────────── */

/** UTC in the compact form calendars use: 20261107T230000Z */
export const calendarStamp = (ts: number) => new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function calendarDetails(e: EventView) {
  return {
    title: `${site.name} ${e.label}: ${e.display.title}`,
    description: `${e.summary ?? copy.eventPage.calendarDescription} ${siteUrl()}/events/${e.slug}`,
    location: e.venue ? `${e.venue.name}, ${e.venue.address}` : site.city,
  };
}

/** Opens Google Calendar with the evening filled in (most Android and Gmail users). */
export function googleCalendarUrl(e: EventView): string | null {
  if (e.startTs === null || e.endTs === null) return null;
  const { title, description, location } = calendarDetails(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(e.startTs)}/${calendarStamp(e.endTs)}`,
    details: description,
    location,
    ctz: TIME_ZONE,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function mailto(address: string, subject?: string): string | null {
  if (!isSet(address)) return null;
  return `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
