import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { copy, site } from "@/content/series";
import { siteUrl } from "@/lib/content";
import { Nav } from "@/components/Nav";
import "./globals.css";

/* Self-hosted, trimmed builds of Mona Sans and Source Serif 4 (see src/fonts/README.md). */
const sans = localFont({
  src: "../fonts/SpeakoutSans-Var.woff2",
  weight: "500 650",
  style: "normal",
  variable: "--font-mona",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const serif = localFont({
  src: "../fonts/SpeakoutSerif-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-source-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["ui-serif", "Georgia", "serif"],
});

const promise = site.promise.join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: copy.meta.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: `${site.name}: ${promise}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: ${promise}`,
    description: site.description,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0f13",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Each key of copy.nav.links is the id of the home page section the link jumps to. */
const navLinks = Object.entries(copy.nav.links).map(([hash, label]) => ({ label, hash }));
const { home, label, menu, close } = copy.nav;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className="skip-link t-label">
          {copy.nav.skipLink}
        </a>
        <Nav name={site.name} links={navLinks} cta={{ label: copy.nav.cta, hash: "signup" }} words={{ home, label, menu, close }} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
