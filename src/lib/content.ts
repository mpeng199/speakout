import { cacheLife } from "next/cache";
import { events, site, speakers, type SeriesEvent, type Speaker } from "@/content/series";

export const TIME_ZONE = "America/New_York";

/** A value written as "[Something]" in the content file still needs real info. */
export function isPlaceholder(value: string | null | undefined): boolean {
  return typeof value === "string" && /^\s*\[.*\]\s*$/.test(value);
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

export function labelNumber(n: number): string {
  return `No. ${String(n).padStart(3, "0")}`;
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
    dateShort: string;
    time: string;
    doors: string | null;
    venue: string;
    address: string | null;
    speaker: string;
    topic: string;
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
      title: e.title ?? (e.number === 1 ? "First evening" : `Evening ${labelNumber(e.number)}`),
      date: startTs !== null ? formatDateLong(startTs) : "Date TBA",
      dateShort: startTs !== null ? formatDateShort(startTs) : "TBA",
      time: startTs !== null ? formatTime(startTs) : "Time TBA",
      doors: doorsTs !== null ? formatTime(doorsTs) : null,
      venue: e.venue?.name ?? "Venue TBA",
      address: e.venue?.address ?? null,
      speaker: speaker ? speaker.name : "To be announced",
      topic: e.topic ?? (e.title ? e.title : "To be announced"),
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

export function mailto(address: string, subject?: string): string | null {
  if (!isSet(address)) return null;
  return `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
