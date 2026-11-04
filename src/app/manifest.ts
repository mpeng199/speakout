import type { MetadataRoute } from "next";
import { site } from "@/content/series";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name}: free evening talks on medicine`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0e0f13",
    theme_color: "#0e0f13",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
