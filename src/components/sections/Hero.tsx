import { copy, site } from "@/content/series";
import { heroLabel } from "@/lib/content";
import { AmberField } from "@/components/visuals/AmberField";
import { Label } from "@/components/ui/Label";
import { Ph } from "@/components/ui/Text";
import { RelativeDay } from "@/components/RelativeDay";
import Link from "next/link";
import { Fragment } from "react";

export async function Hero() {
  // The home page's share image draws this same label (src/app/opengraph-image.tsx).
  const label = await heroLabel();
  const { featured, next, firstEvent } = label;

  const when = next ? (
    <>
      {label.when}
      {next.startTs !== null ? <RelativeDay ts={next.startTs} end={next.endTs} words={copy.relativeDay} /> : null}
    </>
  ) : firstEvent ? (
    <>
      {copy.hero.firstEvent} <Ph value={firstEvent} />
    </>
  ) : (
    <Ph value={label.when} />
  );

  return (
    <section
      id="top"
      aria-label={copy.hero.name}
      data-nav-theme="hero"
      className="hero intro relative isolate flex min-h-[max(100svh,44rem)] flex-col overflow-hidden bg-[color:var(--color-night)] text-[color:var(--color-paper)]"
    >
      <div className="absolute inset-0 -z-10" data-parallax-out="14">
        <AmberField variant="hero" />
      </div>
      <div className="hero-shade pointer-events-none absolute inset-0 -z-10" />

      <div className="wrap relative flex flex-1 flex-col pt-[calc(var(--nav-h)+clamp(2rem,6vh,4.5rem))] pb-[clamp(1.5rem,5vh,3.5rem)]">
        <p className="t-label eyebrow intro-fade" style={{ "--d": 0 } as React.CSSProperties}>
          {site.name} · <Ph value={copy.hero.eyebrow} /> · {site.city}
        </p>

        <h1 className="t-hero mt-[clamp(1.25rem,3.2vh,2.5rem)] max-w-[12ch]">
          <span className="sr-only">{site.name}: </span>
          {site.promise.map((line, i) => (
            <Fragment key={line}>
              {/* The lines are blocks, so this space is never seen, but it keeps the words apart
                  in the heading's text (search results, screen readers, copy and paste). */}
              {i > 0 ? " " : null}
              <span className="mask-line" style={{ "--i": i } as React.CSSProperties}>
                <span className="whitespace-nowrap">{line}</span>
              </span>
            </Fragment>
          ))}
        </h1>

        <div className="hero-bottom grid-12 mt-auto items-end gap-y-10 pt-12">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <p className="hero-sub t-lead max-w-[30ch] text-[color:var(--paper-2)] intro-fade" style={{ "--d": 80 } as React.CSSProperties}>
              <Ph value={copy.hero.sub} />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 intro-fade" style={{ "--d": 160 } as React.CSSProperties}>
              <a href="#signup" className="btn btn-amber magnetic w-full sm:w-auto" data-magnetic="0.3">
                <span className="magnetic-inner">
                  <span>{copy.hero.cta}</span>
                  <span className="arrow-down" aria-hidden="true">
                    ↓
                  </span>
                </span>
              </a>
              <a href="#format" className="t-label link-draw py-2 text-[color:var(--paper-2)] hover:text-[color:var(--color-paper)]">
                {copy.hero.secondary}
              </a>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <Label
              className="hero-label intro-fade"
              reveal="intro"
              left={site.name}
              right={label.number}
              title={
                featured ? (
                  // The whole card opens the evening's page (the link is stretched over it).
                  <Link href={`/events/${featured.slug}`} className="card-link">
                    <Ph value={label.title} linkEmails={false} />
                  </Link>
                ) : (
                  <Ph value={label.title} />
                )
              }
              rows={[
                { term: copy.label.when, detail: when },
                { term: copy.label.where, detail: <Ph value={label.where} /> },
                { term: copy.label.speaker, detail: <Ph value={label.speaker} /> },
                { term: copy.label.admission, detail: <Ph value={label.admission} /> },
              ]}
              footer={
                featured ? (
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <span>
                      <Ph value={copy.label.footer} />
                    </span>
                    <span className="t-label link-draw text-[color:var(--color-night)]" aria-hidden="true">
                      {copy.hero.details}
                    </span>
                  </span>
                ) : (
                  <Ph value={copy.label.footer} />
                )
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
