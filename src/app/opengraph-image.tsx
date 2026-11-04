import { site } from "@/content/series";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = `${site.name}: ${site.promise.join(" ")} Free evening talks on medicine in New York City.`;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return renderOg({
    eyebrow: `${site.name} · Free evening talks on medicine · NYC`,
    lines: site.promise,
    labelLeft: site.name,
    labelRight: "No. 001",
    labelTitle: "An evening of medicine",
    rows: [
      ["Format", "Short talk, then Q&A"],
      ["Where", site.city],
      ["Admission", "Free, open to all"],
    ],
  });
}
