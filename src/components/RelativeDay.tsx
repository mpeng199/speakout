"use client";

import { useSyncExternalStore } from "react";

/** The words, from `copy.relativeDay` in the content file (passed in, so it stays out of the browser bundle). */
export type RelativeWords = { now: string; tonight: string; tomorrow: string; inDays: string };

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

function relative(ts: number, end: number | null, words: RelativeWords): string {
  const now = new Date();
  if (ts <= now.getTime()) return end !== null && now.getTime() < end ? words.now : "";
  const [y1, m1, d1] = dayKey(now).split("-").map(Number);
  const [y2, m2, d2] = dayKey(new Date(ts)).split("-").map(Number);
  const days = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  if (days === 0) return words.tonight;
  if (days === 1) return words.tomorrow;
  if (days < 14) return words.inDays.replace("{days}", String(days));
  return "";
}

const subscribe = () => () => {};

/**
 * "tonight", "tomorrow", "in 5 days" next to an upcoming date, and "happening now"
 * while the evening runs. Worked out in the visitor's browser (the page itself is
 * static), and empty on the server so hydration always matches.
 */
export function RelativeDay({ ts, end = null, words }: { ts: number; end?: number | null; words: RelativeWords }) {
  const text = useSyncExternalStore(
    subscribe,
    () => relative(ts, end, words),
    () => "",
  );
  if (!text) return null;
  return <span className="text-[color:var(--night-3)]"> · {text}</span>;
}
