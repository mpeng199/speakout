import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { copy, events, site } from "@/content/series";
import { eventBySlug, fill, getSchedule, googleCalendarUrl } from "@/lib/content";
import { AmberField } from "@/components/visuals/AmberField";
import { Label } from "@/components/ui/Label";
import { EventJsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Motion } from "@/components/motion/Motion";
import { ShareButton } from "@/components/ShareButton";
import { RelativeDay } from "@/components/RelativeDay";
import { Ph } from "@/components/ui/Text";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) return {};
  const title = `${event.label}: ${event.display.title}`;
  const t = copy.eventPage;
  const description = event.summary
    ? event.summary
    : fill(t.metaDescription, {
        title: event.display.title,
        when: event.isTba ? t.metaWhenTba : fill(t.metaWhen, { date: event.display.date, time: event.display.time }),
      });
  return {
    title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { type: "website", title: `${site.name} ${title}`, description, url: `/events/${event.slug}` },
    twitter: { card: "summary_large_image", title: `${site.name} ${title}`, description },
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) notFound();

  const { past } = await getSchedule();
  const isPast = past.some((p) => p.slug === event.slug);
  const googleCalendar = googleCalendarUrl(event);
  const t = copy.eventPage;
  const { doors, end } = event.display;
  // Once the evening has a time, each step of "How the evening runs" shows when it happens.
  const times: (string | null)[] = event.isTba
    ? []
    : [doors ? fill(t.runsDoors, { time: doors }) : null, event.display.time, end ? fill(t.runsUntil, { time: end }) : null];
  const status = event.isTba ? t.status.tba : isPast ? t.status.past : t.status.upcoming;
  const speaker = event.speaker;

  const rows = [
    {
      term: copy.label.when,
      detail: event.isTba ? (
        event.display.date
      ) : (
        <>
          {event.display.date}
          {event.startTs !== null && !isPast ? <RelativeDay ts={event.startTs} end={event.endTs} words={copy.relativeDay} /> : null}
        </>
      ),
    },
    { term: copy.label.time, detail: doors ? fill(t.timeWithDoors, { time: event.display.time, doors }) : event.display.time },
    {
      term: copy.label.where,
      detail: event.venue ? (
        <>
          <Ph value={event.venue.name} />
          <br />
          <span className="text-[color:var(--night-2)]">
            <Ph value={event.venue.address} />
          </span>
        </>
      ) : (
        <Ph value={event.display.venue} />
      ),
    },
    { term: copy.label.speaker, detail: <Ph value={event.display.speaker} /> },
    { term: copy.label.admission, detail: <Ph value={copy.label.free} /> },
  ];

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>
      {/* ───────────── Hero ───────────── */}
      <section
        id="top"
        aria-labelledby="event-title"
        data-nav-theme="hero"
        className="hero intro relative isolate flex min-h-[min(100svh,58rem)] flex-col overflow-hidden bg-[color:var(--color-night)]"
      >
        <div className="absolute inset-0 -z-10" data-parallax-out="12">
          <AmberField variant="page" />
        </div>
        <div className="hero-shade pointer-events-none absolute inset-0 -z-10" />

        <div className="wrap relative flex flex-1 flex-col pt-[calc(var(--nav-h)+clamp(1.5rem,5vh,3.5rem))] pb-[clamp(2rem,6vh,4rem)]">
          <nav aria-label={t.breadcrumb} className="intro-fade" style={{ "--d": 0 } as React.CSSProperties}>
            <ol className="t-label flex flex-wrap items-center gap-2 text-[color:var(--paper-3)]">
              <li>
                <Link href="/" className="link-draw hover:text-[color:var(--color-paper)]">
                  {site.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#events" className="link-draw hover:text-[color:var(--color-paper)]">
                  {t.breadcrumbEvents}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="tabular text-[color:var(--paper-2)]">
                {event.label}
              </li>
            </ol>
          </nav>

          <div className="grid-12 mt-auto items-end gap-y-12 pt-16">
            <div className="col-span-12 lg:col-span-7">
              <p className="intro-fade flex items-center gap-3" style={{ "--d": 40 } as React.CSSProperties}>
                <span className={event.isTba ? "tba-chip t-label" : "t-label eyebrow"}>{status}</span>
                {event.topic ? (
                  <span className="t-label text-[color:var(--paper-3)]">
                    <Ph value={event.topic} />
                  </span>
                ) : null}
              </p>
              <h1 id="event-title" className={`${event.display.title.length > 18 ? "t-d1 max-w-[18ch]" : "t-hero"} balance mt-6`}>
                <span className="sr-only">
                  {site.name} {event.label}:{" "}
                </span>
                <span className="mask-line">
                  <span>
                    <Ph value={event.display.title} />
                  </span>
                </span>
              </h1>
              <p className="t-lead mt-8 max-w-[38ch] text-[color:var(--paper-2)] intro-fade" style={{ "--d": 100 } as React.CSSProperties}>
                <Ph value={event.summary ?? (event.isTba ? t.introTba : t.intro)} />
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 intro-fade" style={{ "--d": 180 } as React.CSSProperties}>
                {event.rsvpUrl && !isPast ? (
                  <a href={event.rsvpUrl} className="btn btn-amber btn-wrap magnetic w-full sm:w-auto" data-magnetic="0.3" target="_blank" rel="noopener noreferrer">
                    <span className="magnetic-inner">
                      <span>{t.rsvp}</span>
                      <span className="arrow" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                    <span className="sr-only"> {copy.newTab}</span>
                  </a>
                ) : (
                  <a href="#signup" className="btn btn-amber btn-wrap magnetic w-full sm:w-auto" data-magnetic="0.3">
                    <span className="magnetic-inner">
                      <span>{isPast ? t.notifyPast : t.notify}</span>
                      <span className="arrow-down" aria-hidden="true">
                        ↓
                      </span>
                    </span>
                  </a>
                )}
                <ShareButton
                  title={`${site.name} ${event.label}: ${event.display.title}`}
                  words={{ share: t.share, shareCopied: t.shareCopied, shareFailed: t.shareFailed }}
                  className="t-label link-draw cursor-pointer border-0 bg-transparent py-2 text-[color:var(--paper-2)] hover:text-[color:var(--color-paper)] print:hidden"
                />
              </div>
              {googleCalendar && !isPast ? (
                <p className="t-label mt-6 flex flex-wrap items-baseline gap-x-5 text-[color:var(--paper-2)] intro-fade print:hidden" style={{ "--d": 220 } as React.CSSProperties}>
                  <span className="basis-full pb-1 sm:basis-auto sm:pb-0">{t.calendar}</span>
                  <a href={googleCalendar} target="_blank" rel="noopener noreferrer" className="link-draw py-2 hover:text-[color:var(--color-paper)]">
                    {t.calendarGoogle}
                    <span className="sr-only"> {t.calendarGoogleMore}</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                  <a href={`/events/${event.slug}/calendar.ics`} className="link-draw py-2 hover:text-[color:var(--color-paper)]">
                    {t.calendarOther}
                    <span className="sr-only"> {t.calendarOtherMore}</span>
                  </a>
                </p>
              ) : null}
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
              <ViewTransition name={`label-${event.slug}`} share="morph" default="none">
                <Label className="hero-label vt-label intro-fade" reveal="intro" left={site.name} right={event.label} title={t.labelTitle} rows={rows} footer={<Ph value={copy.label.footer} />} />
              </ViewTransition>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── The talk + speaker ───────────── */}
      <section aria-labelledby="talk-title" data-nav-theme="paper" className="panel panel-paper on-paper">
        <div className="wrap grid-12 gap-y-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 id="talk-title" className="t-label eyebrow">
              {t.talkLabel}
            </h2>
            {event.title && event.summary ? (
              <>
                <p className="t-d2 balance mt-8" data-reveal="lines">
                  <Ph value={event.title} />
                </p>
                <p className="t-lead mt-6 max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                  <Ph value={event.summary} />
                </p>
              </>
            ) : (
              <>
                <p className="t-d2 balance mt-8" data-reveal="lines">
                  <Ph value={t.talkTba} />
                </p>
                <p className="t-lead mt-6 max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                  <Ph value={t.talkTbaText} />
                </p>
                <Link href="/#topics" className="t-label link mt-6 inline-block print:hidden">
                  {t.talkTbaLink}
                </Link>
              </>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h2 className="t-label eyebrow">{t.speakerLabel}</h2>
            {speaker ? (
              <div className={`mt-8 grid gap-6 ${speaker.photo ? "sm:grid-cols-[10rem_1fr]" : "grid-cols-[4.5rem_1fr]"}`}>
                <div className={speaker.photo ? "speaker-portrait w-40" : "speaker-badge"}>
                  {speaker.photo ? (
                    <Image src={speaker.photo} alt={fill(copy.speakers.portrait, { name: speaker.name })} fill sizes="10rem" className="object-cover" />
                  ) : (
                    <span className="t-d3" aria-hidden="true">
                      {speaker.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div>
                  <p className="t-d3">
                    <Ph value={speaker.name} />
                  </p>
                  <p className="t-small mt-1 text-[color:var(--night-2)]">
                    <Ph value={speaker.role} />, <Ph value={speaker.affiliation} />
                  </p>
                  <p className="t-body mt-4">
                    <Ph value={speaker.bio} />
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="t-d2 mt-8" data-reveal="lines">
                  <Ph value={t.speakerTba} />
                </p>
                <p className="t-lead mt-6 max-w-[34ch] text-[color:var(--night-2)]" data-reveal="fade">
                  <Ph value={t.speakerTbaText} />
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── How the evening runs ───────────── */}
      <section aria-labelledby="runs-title" data-nav-theme="night" className="panel panel-dark">
        <div className="wrap">
          <h2 id="runs-title" className="t-label eyebrow">
            {t.runsLabel}
          </h2>
          {/* On large screens the columns share rows (subgrid), so the text starts on one line even when a title wraps. */}
          <ol className="mt-12 grid gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-3 lg:gap-y-0" data-reveal="stagger">
            {copy.evening.steps.map((s, i) => (
              <li key={s.title} className="border-t border-[color:var(--paper-line)] pt-6 lg:row-span-3 lg:grid lg:grid-rows-subgrid">
                <p className="t-label tabular text-[color:var(--color-amber)]">
                  {String(i + 1).padStart(2, "0")}
                  {times[i] ? <span className="text-[color:var(--paper-2)]"> · {times[i]}</span> : null}
                </p>
                <h3 className="t-d2 mt-4">
                  <Ph value={s.title} />
                </h3>
                <p className="t-body mt-4 max-w-[34ch] text-[color:var(--paper-2)]">
                  <Ph value={s.text} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── Getting there ───────────── */}
      <section aria-labelledby="venue-title" data-nav-theme="paper" className="panel panel-paper on-paper">
        <div className="wrap grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <h2 id="venue-title" className="t-label eyebrow">
              {t.venueLabel}
            </h2>
            {/* Long venue names ("…, Second Floor Reading Room") step down a size so they don't fill the column. */}
            <p className={`${event.venue && event.venue.name.length > 26 ? "t-d2" : "t-d1"} balance mt-8`} data-reveal="lines">
              <Ph value={event.venue ? event.venue.name : t.venueTba} />
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-16">
            {event.venue ? (
              <>
                <p className="t-lead">
                  <Ph value={event.venue.address} />
                </p>
                {event.venue.notes ? (
                  <p className="t-body mt-4 text-[color:var(--night-2)]">
                    <Ph value={event.venue.notes} />
                  </p>
                ) : null}
                {event.venue.mapUrl ? (
                  <a href={event.venue.mapUrl} className="t-label link mt-6 inline-block" target="_blank" rel="noopener noreferrer">
                    {t.venueMap}
                    <span className="sr-only"> {copy.newTab}</span>
                  </a>
                ) : null}
              </>
            ) : (
              <p className="t-lead max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                <Ph value={t.venueTbaText} />
              </p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
      <EventJsonLd event={event} />
      <Motion />
      </div>
    </ViewTransition>
  );
}
