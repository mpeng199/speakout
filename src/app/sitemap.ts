import type { MetadataRoute } from "next";
import { events } from "@/content/series";
import { siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...events.map((e) => ({ url: `${base}/events/${e.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
