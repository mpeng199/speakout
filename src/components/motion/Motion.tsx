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
    let runs = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Also runs when reduced motion is switched on or off while the page is open: the previous
    // setup is reverted (every element back as rendered) before the new one starts.
    const run = async () => {
      const id = ++runs;
      cleanup?.();
      cleanup = undefined;
      const reduce = media.matches;
      document.documentElement.dataset.motion = reduce ? "reduce" : "full";
      const { setupMotion } = await import("./setup");
      // A newer run (the setting changed again while the module loaded) wins.
      if (cancelled || id !== runs) return;
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
