"use client";

import { useState } from "react";

/** The button's words, from `copy.eventPage` in the content file. */
type ShareWords = { share: string; shareCopied: string; shareFailed: string };

/** Shares the current page: the system share sheet where there is one, otherwise copies the link. */
export function ShareButton({ title, words, className = "" }: { title: string; words: ShareWords; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function onClick() {
    const url = window.location.href.split("#")[0];
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        // Cancelled or unavailable: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2400);
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span aria-live="polite">{state === "copied" ? words.shareCopied : state === "failed" ? words.shareFailed : words.share}</span>
    </button>
  );
}
