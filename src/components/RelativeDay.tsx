"use client";

import { useSyncExternalStore } from "react";

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

function relative(ts: number, end: number | null): string {
  const now = new Date();
  if (ts <= now.getTime()) return end !== null && now.getTime() < end ? "happening now" : "";
  const [y1, m1, d1] = dayKey(now).split("-").map(Number);
  const [y2, m2, d2] = dayKey(new Date(ts)).split("-").map(Number);
  const days = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  if (days === 0) return "tonight";
  if (days === 1) return "tomorrow";
  if (days < 14) return `in ${days} days`;
  return "";
}

const subscribe = () => () => {};

/**
 * "tonight", "tomorrow", "in 5 days" next to an upcoming date, and "happening now"
 * while the evening runs. Worked out in the visitor's browser (the page itself is
 * static), and empty on the server so hydration always matches.
 */
export function RelativeDay({ ts, end = null }: { ts: number; end?: number | null }) {
  const text = useSyncExternalStore(
    subscribe,
    () => relative(ts, end),
    () => "",
  );
  if (!text) return null;
  return <span className="text-[color:var(--night-3)]"> · {text}</span>;
}
