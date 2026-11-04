"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Loads the motion layer after the page is interactive. Render it last inside
 * a page, so it starts only after the page has hydrated (the motion layer
 * splits text and pins sections, which must not happen before React has
 * adopted that markup). All content is readable without it.
 */
export function Motion() {
  const pathname = usePathname();

  // Mark client-side navigations: the label that morphs between pages should
  // not also replay its page-load intro.
  useEffect(() => {
    const mark = (e: Event) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='/']");
      if (a || e.type === "popstate") document.documentElement.dataset.navigated = "true";
    };
    document.addEventListener("click", mark, true);
    window.addEventListener("popstate", mark);
    return () => {
      document.removeEventListener("click", mark, true);
      window.removeEventListener("popstate", mark);
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const run = async () => {
      cleanup?.();
      const reduce = media.matches;
      document.documentElement.dataset.motion = reduce ? "reduce" : "full";
      const { setupMotion } = await import("./setup");
      if (cancelled) return;
      cleanup = setupMotion({ reduce });
    };

    run();
    const onChange = () => run();
    media.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      media.removeEventListener("change", onChange);
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
