import { copy, site } from "@/content/series";
import { heroLabel, unlessPlaceholder, untitledTitle } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = copy.shareImage.homeAlt;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

/** The home page's share image: the promise, and the same label as the hero (the evening, number, title and rows). */
export default async function Image() {
  const label = await heroLabel();
  return renderOg({
    eyebrow: copy.shareImage.eyebrow,
    lines: site.promise,
    labelLeft: site.name,
    labelRight: label.number,
    labelTitle: label.featured ? unlessPlaceholder(label.title, untitledTitle(label.featured.number)) : label.title,
    rows: [
      // "First event: [Month Year]" until the month is filled in
      [copy.label.when, unlessPlaceholder(label.when, copy.tba.long)],
      [copy.label.where, unlessPlaceholder(label.where, copy.tba.venue)],
      [copy.label.speaker, unlessPlaceholder(label.speaker, copy.tba.long)],
      [copy.label.admission, label.admission],
    ],
  });
}
