import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/series";
import { AmberField } from "@/components/visuals/AmberField";
import { Ph } from "@/components/ui/Text";

// Next.js adds noindex to 404 responses; the canonical inherited from the layout would point at the home page.
export const metadata: Metadata = {
  title: copy.notFound.title,
  description: copy.notFound.description,
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section data-nav-theme="hero" className="intro relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <AmberField variant="page" />
      </div>
      <div className="hero-shade pointer-events-none absolute inset-0 -z-10" />
      <div className="wrap flex flex-1 flex-col justify-center pt-[var(--nav-h)]">
        <p className="t-label eyebrow intro-fade">{copy.notFound.eyebrow}</p>
        <h1 className="t-hero mt-6">
          <span className="mask-line">
            <span>
              <Ph value={copy.notFound.heading} />
            </span>
          </span>
        </h1>
        <p className="t-lead mt-8 max-w-[34ch] text-[color:var(--paper-2)] intro-fade" style={{ "--d": 80 } as React.CSSProperties}>
          <Ph value={copy.notFound.text} />
        </p>
        <div className="mt-10 intro-fade" style={{ "--d": 160 } as React.CSSProperties}>
          <Link href="/" className="btn btn-amber">
            <span>{copy.notFound.button}</span>
            <span className="arrow-right" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
