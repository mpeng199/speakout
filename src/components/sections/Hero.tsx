import { copy, site } from "@/content/series";
import { getSchedule } from "@/lib/content";
import { AmberField } from "@/components/visuals/AmberField";
import { Label } from "@/components/ui/Label";
import { Ph } from "@/components/ui/Text";

export async function Hero() {
  const { next, upcoming } = await getSchedule();
  const featured = next ?? upcoming[0] ?? null;

  const when = next ? (
    <>
      {next.display.dateShort}, {next.display.time}
    </>
  ) : (
    <>
      First event: <Ph value={site.firstEventLabel} />
    </>
  );

  return (
    <section
      id="top"
      aria-label="Introduction"
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
            <span className="mask-line" key={line} style={{ "--i": i } as React.CSSProperties}>
              <span className="whitespace-nowrap">{line}</span>
            </span>
          ))}
        </h1>

        <div className="grid-12 mt-auto items-end gap-y-10 pt-12">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <p className="t-lead max-w-[30ch] text-[color:var(--paper-2)] intro-fade" style={{ "--d": 80 } as React.CSSProperties}>
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

          <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9">
            <Label
              className="hero-label intro-fade"
              reveal="intro"
              left={site.name}
              right={featured ? featured.label : "No. 001"}
              title={featured ? featured.display.title : "First evening"}
              rows={[
                { term: "When", detail: when },
                {
                  term: "Where",
                  detail: next?.venue ? next.venue.name : site.city,
                },
                { term: "Format", detail: "10–15 minute talk, then open Q&A" },
                { term: "Admission", detail: "Free. Everyone welcome." },
              ]}
              footer="No slides. No science background needed."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
