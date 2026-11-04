import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/content/series";
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

const title = `${site.name} · Free evening talks on medicine in New York`;
const promise = site.promise.join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: title, template: `%s · ${site.name}` },
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

const navLinks = [
  { label: "About", hash: "about" },
  { label: "Format", hash: "format" },
  { label: "Topics", hash: "topics" },
  { label: "Events", hash: "events" },
  { label: "Speakers", hash: "speakers" },
  { label: "FAQ", hash: "faq" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className="skip-link t-label">
          Skip to content
        </a>
        <Nav name={site.name} links={navLinks} cta={{ label: "Get on the list", hash: "signup" }} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
