import { copy, site } from "@/content/series";
import { getSchedule, labelNumber } from "@/lib/content";
import { AmberField } from "@/components/visuals/AmberField";
import { Label } from "@/components/ui/Label";
import { Ph } from "@/components/ui/Text";
import { RelativeDay } from "@/components/RelativeDay";
import Link from "next/link";
import { Fragment } from "react";

export async function Hero() {
  const { next, upcoming, past } = await getSchedule();
  const featured = next ?? upcoming[0] ?? null;
  // With nothing upcoming, the label points at the next number in the series.
  const nextNumber = Math.max(0, ...upcoming.map((e) => e.number), ...past.map((e) => e.number)) + 1;
  const isFirst = !past.length && (!featured || featured.number === 1);

  const when = next ? (
    <>
      {next.display.dateShort}, {next.display.time}
      {next.startTs !== null ? <RelativeDay ts={next.startTs} end={next.endTs} words={copy.relativeDay} /> : null}
    </>
  ) : isFirst && site.firstEventLabel.trim() ? (
    <>
      {copy.hero.firstEvent} <Ph value={site.firstEventLabel} />
    </>
  ) : (
    copy.tba.when
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
          {site.name} · {copy.hero.eyebrow} · {site.city}
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
              {copy.hero.sub}
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
              right={featured ? featured.label : labelNumber(nextNumber)}
              title={
                featured ? (
                  // The whole card opens the evening's page (the link is stretched over it).
                  <Link href={`/events/${featured.slug}`} className="card-link">
                    {featured.display.title}
                  </Link>
                ) : isFirst ? (
                  copy.untitled.first
                ) : (
                  copy.untitled.next
                )
              }
              rows={[
                { term: copy.label.when, detail: when },
                {
                  term: copy.label.where,
                  detail: next?.venue ? next.venue.name : site.city,
                },
                { term: copy.label.format, detail: copy.hero.format },
                { term: copy.label.admission, detail: copy.label.free },
              ]}
              footer={
                featured ? (
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <span>{copy.label.footer}</span>
                    <span className="t-label link-draw text-[color:var(--color-night)]" aria-hidden="true">
                      {copy.hero.details}
                    </span>
                  </span>
                ) : (
                  copy.label.footer
                )
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
