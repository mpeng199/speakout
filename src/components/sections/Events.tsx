import Link from "next/link";
import { ViewTransition } from "react";
import { copy, site } from "@/content/series";
import { getSchedule, type EventView } from "@/lib/content";
import { Label } from "@/components/ui/Label";

export function EventCard({ event, headingLevel = "h3" }: { event: EventView; headingLevel?: "h2" | "h3" }) {
  const rows = [
    { term: "When", detail: event.isTba ? "Date TBA" : `${event.display.dateMedium} · ${event.display.time}` },
    { term: "Where", detail: event.venue ? event.venue.name : `Venue TBA, ${site.city}` },
    { term: "Speaker", detail: event.display.speaker },
    { term: "Topic", detail: event.display.topic },
  ];
  return (
    <article className="event-card" aria-labelledby={`event-${event.slug}`}>
      {/* The label morphs into the event page's label on navigation */}
      <ViewTransition name={`label-${event.slug}`} share="morph" default="none">
      <Label
        className="vt-label"
        left={
          <span className="inline-flex items-center gap-2.5">
            {site.name}
            {event.isTba ? <span className="tba-chip">TBA</span> : null}
          </span>
        }
        right={event.label}
        title={
          <Link href={`/events/${event.slug}`} id={`event-${event.slug}`} className="event-card-link">
            {event.display.title}
          </Link>
        }
        titleAs={headingLevel}
        rows={rows}
        footer={
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            {event.rsvpUrl ? (
              <a href={event.rsvpUrl} className="btn btn-night relative z-[2]" target="_blank" rel="noopener noreferrer">
                <span>RSVP</span>
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
                <span className="sr-only"> for {event.display.title} (opens in a new tab)</span>
              </a>
            ) : (
              <span className="btn" aria-disabled="true">
                RSVP opens soon
              </span>
            )}
            <span className="t-label link-draw relative z-[1]" aria-hidden="true">
              Event details →
            </span>
          </div>
        }
      />
      </ViewTransition>
    </article>
  );
}

export async function Events() {
  const { upcoming } = await getSchedule();

  return (
    <section id="events" aria-labelledby="events-title" data-nav-theme="night" className="panel panel-dark">
      <div className="wrap">
        <div className="grid-12 gap-y-6">
          <p className="t-label eyebrow col-span-12">{copy.events.label}</p>
          <h2 id="events-title" className="t-d1 balance col-span-12 mt-2 lg:col-span-8" data-reveal="lines">
            {copy.events.title}
          </h2>
        </div>

        <div className="grid-12 mt-[clamp(3rem,6vw,5rem)] items-start gap-y-10">
          <ul className="col-span-12 grid gap-[var(--gutter)] lg:col-span-7" aria-label="Upcoming events">
            {upcoming.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-4">
            <p className="t-lead text-[color:var(--paper-2)]" data-reveal="fade">
              {copy.events.note}
            </p>
            <a href="#signup" className="t-label link mt-6 inline-block">
              Get on the list ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
