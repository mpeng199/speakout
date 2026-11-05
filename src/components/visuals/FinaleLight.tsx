"use client";

import { useEffect, useRef, useState } from "react";
import { AmberField } from "./AmberField";

/**
 * The amber light comes back behind the signup. It is mounted only while it is on (or about to
 * reach) the screen, so its WebGL context exists only then: iOS Safari drops the oldest context
 * once a page holds a handful, and the hero and the evening already have one each. Leaving the
 * screen unmounts it, which releases the context. The form drives it through the registry ("finale").
 */
export function FinaleLight() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="finale-light" aria-hidden="true">
      {near ? (
        <>
          <AmberField variant="finale" id="finale" />
          <div className="finale-shade" />
        </>
      ) : null}
    </div>
  );
}
