import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { copy, events, site } from "@/content/series";
import { eventBySlug, getSchedule, googleCalendarUrl } from "@/lib/content";
import { AmberField } from "@/components/visuals/AmberField";
import { Label } from "@/components/ui/Label";
import { EventJsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { Motion } from "@/components/motion/Motion";
import { ShareButton } from "@/components/ShareButton";
import { RelativeDay } from "@/components/RelativeDay";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) return {};
  const title = `${event.label}: ${event.display.title}`;
  const description = event.summary
    ? event.summary
    : `${event.display.title} at ${site.name}, a free evening talk on medicine in ${site.city}. ${event.isTba ? "Date, venue and speaker to be announced." : `${event.display.date}, ${event.display.time}.`}`;
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
  const status = event.isTba ? "TBA" : isPast ? "Past event" : "Upcoming";
  const speaker = event.speaker;

  const rows = [
    {
      term: "When",
      detail: event.isTba ? (
        "Date TBA"
      ) : (
        <>
          {event.display.date}
          {event.startTs !== null && !isPast ? <RelativeDay ts={event.startTs} /> : null}
        </>
      ),
    },
    { term: "Time", detail: event.isTba ? "Time TBA" : `${event.display.time}${event.display.doors ? `, doors ${event.display.doors}` : ""}` },
    {
      term: "Where",
      detail: event.venue ? (
        <>
          {event.venue.name}
          <br />
          <span className="text-[color:var(--night-2)]">{event.venue.address}</span>
        </>
      ) : (
        `Venue TBA, ${site.city}`
      ),
    },
    { term: "Speaker", detail: event.display.speaker },
    { term: "Admission", detail: "Free. Everyone welcome." },
  ];

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>
      {/* ───────────── Hero ───────────── */}
      <section
        id="top"
        aria-labelledby="event-title"
        data-nav-theme="hero"
        className="intro relative isolate flex min-h-[min(100svh,58rem)] flex-col overflow-hidden bg-[color:var(--color-night)]"
      >
        <div className="absolute inset-0 -z-10" data-parallax-out="12">
          <AmberField variant="page" />
        </div>
        <div className="hero-shade pointer-events-none absolute inset-0 -z-10" />

        <div className="wrap relative flex flex-1 flex-col pt-[calc(var(--nav-h)+clamp(1.5rem,5vh,3.5rem))] pb-[clamp(2rem,6vh,4rem)]">
          <nav aria-label="Breadcrumb" className="intro-fade" style={{ "--d": 0 } as React.CSSProperties}>
            <ol className="t-label flex flex-wrap items-center gap-2 text-[color:var(--paper-3)]">
              <li>
                <Link href="/" className="link-draw hover:text-[color:var(--color-paper)]">
                  {site.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#events" className="link-draw hover:text-[color:var(--color-paper)]">
                  Events
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
                {event.topic ? <span className="t-label text-[color:var(--paper-3)]">{event.topic}</span> : null}
              </p>
              <h1 id="event-title" className={`${event.display.title.length > 18 ? "t-d1 max-w-[18ch]" : "t-hero"} balance mt-6`}>
                <span className="sr-only">
                  {site.name} {event.label}:{" "}
                </span>
                <span className="mask-line">
                  <span>{event.display.title}</span>
                </span>
              </h1>
              <p className="t-lead mt-8 max-w-[38ch] text-[color:var(--paper-2)] intro-fade" style={{ "--d": 100 } as React.CSSProperties}>
                {event.summary ??
                  (event.isTba
                    ? `The date, venue, speaker and topic for this evening will be announced soon. Join the mailing list and we’ll tell you as soon as they’re set.`
                    : `A researcher talks for 10 to 15 minutes, without slides. Then the room asks questions.`)}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 intro-fade" style={{ "--d": 180 } as React.CSSProperties}>
                {event.rsvpUrl && !isPast ? (
                  <a href={event.rsvpUrl} className="btn btn-amber btn-wrap magnetic w-full sm:w-auto" data-magnetic="0.3" target="_blank" rel="noopener noreferrer">
                    <span className="magnetic-inner">
                      <span>RSVP</span>
                      <span className="arrow" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <a href="#signup" className="btn btn-amber btn-wrap magnetic w-full sm:w-auto" data-magnetic="0.3">
                    <span className="magnetic-inner">
                      <span>{isPast ? "Hear about the next one" : "Get notified when RSVP opens"}</span>
                      <span className="arrow-down" aria-hidden="true">
                        ↓
                      </span>
                    </span>
                  </a>
                )}
                <ShareButton
                  title={`${site.name} ${event.label}: ${event.display.title}`}
                  className="t-label link-draw cursor-pointer border-0 bg-transparent py-2 text-[color:var(--paper-2)] hover:text-[color:var(--color-paper)]"
                />
              </div>
              {googleCalendar && !isPast ? (
                <p className="t-label mt-6 flex flex-wrap items-baseline gap-x-5 text-[color:var(--paper-2)] intro-fade" style={{ "--d": 220 } as React.CSSProperties}>
                  <span className="basis-full pb-1 sm:basis-auto sm:pb-0">Add to calendar:</span>
                  <a href={googleCalendar} target="_blank" rel="noopener noreferrer" className="link-draw py-2 hover:text-[color:var(--color-paper)]">
                    Google<span className="sr-only"> Calendar (opens in a new tab)</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                  <a href={`/events/${event.slug}/calendar.ics`} className="link-draw py-2 hover:text-[color:var(--color-paper)]">
                    Apple, Outlook<span className="sr-only"> and other calendars (.ics file)</span>
                  </a>
                </p>
              ) : null}
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <ViewTransition name={`label-${event.slug}`} share="morph" default="none">
                <Label className="hero-label vt-label intro-fade" reveal="intro" left={site.name} right={event.label} title="Details" rows={rows} footer="No slides. No science background needed." />
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
              The talk
            </h2>
            {event.title && event.summary ? (
              <>
                <p className="t-d2 balance mt-8" data-reveal="lines">
                  {event.title}
                </p>
                <p className="t-lead mt-6 max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                  {event.summary}
                </p>
              </>
            ) : (
              <>
                <p className="t-d2 balance mt-8" data-reveal="lines">
                  Topic to be announced.
                </p>
                <p className="t-lead mt-6 max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                  Each evening takes on one question about medicine or drug development, explained for people with no science background.
                </p>
                <Link href="/#topics" className="t-label link mt-6 inline-block">
                  See example topics →
                </Link>
              </>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h2 className="t-label eyebrow">Speaker</h2>
            {speaker ? (
              <div className={`mt-8 grid gap-6 ${speaker.photo ? "sm:grid-cols-[10rem_1fr]" : "grid-cols-[4.5rem_1fr]"}`}>
                <div className={speaker.photo ? "speaker-portrait w-40" : "speaker-badge"}>
                  {speaker.photo ? (
                    <Image src={speaker.photo} alt={`Portrait of ${speaker.name}`} fill sizes="10rem" className="object-cover" />
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
                  <p className="t-d3">{speaker.name}</p>
                  <p className="t-small mt-1 text-[color:var(--night-2)]">
                    {speaker.role}, {speaker.affiliation}
                  </p>
                  <p className="t-body mt-4">{speaker.bio}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="t-d2 mt-8" data-reveal="lines">
                  To be announced.
                </p>
                <p className="t-lead mt-6 max-w-[34ch] text-[color:var(--night-2)]" data-reveal="fade">
                  We name speakers once they’ve confirmed.
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
            How the evening runs
          </h2>
          {/* On large screens the columns share rows (subgrid), so the text starts on one line even when a title wraps. */}
          <ol className="mt-12 grid gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-3 lg:gap-y-0" data-reveal="stagger">
            {copy.evening.steps.map((s, i) => (
              <li key={s.title} className="border-t border-[color:var(--paper-line)] pt-6 lg:row-span-3 lg:grid lg:grid-rows-subgrid">
                <p className="t-label tabular text-[color:var(--color-amber)]">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-d2 mt-4">{s.title}</h3>
                <p className="t-body mt-4 max-w-[34ch] text-[color:var(--paper-2)]">{s.text}</p>
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
              Getting there
            </h2>
            <p className="t-d1 mt-8" data-reveal="lines">
              {event.venue ? event.venue.name : "Venue to be announced."}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-16">
            {event.venue ? (
              <>
                <p className="t-lead">{event.venue.address}</p>
                {event.venue.notes ? <p className="t-body mt-4 text-[color:var(--night-2)]">{event.venue.notes}</p> : null}
                {event.venue.mapUrl ? (
                  <a href={event.venue.mapUrl} className="t-label link mt-6 inline-block" target="_blank" rel="noopener noreferrer">
                    Open in maps ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : null}
              </>
            ) : (
              <p className="t-lead max-w-[40ch] text-[color:var(--night-2)]" data-reveal="fade">
                The address, entrance and nearest subway will be listed here once the venue is confirmed. Every evening is in {site.city}.
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
