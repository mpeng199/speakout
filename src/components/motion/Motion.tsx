"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Loads the motion layer after the page is interactive. All content is in the
 * server-rendered HTML and fully readable without this.
 */
export function Motion() {
  const pathname = usePathname();

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
