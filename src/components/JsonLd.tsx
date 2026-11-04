import { site } from "@/content/series";
import { allEvents, isSet, siteUrl, type EventView } from "@/lib/content";

function Script({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** schema.org Event for an evening that has a date and a venue. */
export function eventSchema(e: EventView) {
  if (e.startTs === null || !e.venue) return null;
  const url = `${siteUrl()}/events/${e.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${site.name} ${e.label}: ${e.display.title}`,
    description: e.summary ?? site.description,
    startDate: new Date(e.startTs).toISOString(),
    endDate: e.endTs ? new Date(e.endTs).toISOString() : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    url,
    location: {
      "@type": "Place",
      name: e.venue.name,
      address: { "@type": "PostalAddress", streetAddress: e.venue.address, addressLocality: "New York", addressRegion: "NY", addressCountry: "US" },
    },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", availability: "https://schema.org/InStock", url: e.rsvpUrl ?? url },
    performer: e.speaker ? { "@type": "Person", name: e.speaker.name } : undefined,
    organizer: { "@type": "Person", name: site.organizer.name, url: siteUrl() },
  };
}

export function SeriesJsonLd() {
  const subEvents = allEvents().map(eventSchema).filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: site.name,
    description: site.description,
    url: siteUrl(),
    isAccessibleForFree: true,
    location: { "@type": "City", name: site.city },
    organizer: { "@type": "Person", name: site.organizer.name, ...(isSet(site.contactEmail) ? { email: site.contactEmail } : {}) },
    ...(subEvents.length ? { subEvent: subEvents } : {}),
  };
  return <Script data={data} />;
}

export function EventJsonLd({ event }: { event: EventView }) {
  const data = eventSchema(event);
  return data ? <Script data={data} /> : null;
}
