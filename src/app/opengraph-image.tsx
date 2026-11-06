import { copy, site } from "@/content/series";
import { labelNumber } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = copy.shareImage.homeAlt;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return renderOg({
    eyebrow: copy.shareImage.eyebrow,
    lines: site.promise,
    labelLeft: site.name,
    labelRight: labelNumber(1),
    labelTitle: copy.shareImage.homeTitle,
    rows: [
      [copy.label.format, copy.shareImage.format],
      [copy.label.where, site.city],
      [copy.label.admission, copy.shareImage.admission],
    ],
  });
}
