import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Evening } from "@/components/sections/Evening";
import { Topics } from "@/components/sections/Topics";
import { Events } from "@/components/sections/Events";
import { Speakers } from "@/components/sections/Speakers";
import { Researchers } from "@/components/sections/Researchers";
import { Faq } from "@/components/sections/Faq";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SeriesJsonLd } from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Evening />
      <Topics />
      <Events />
      <Speakers />
      <Researchers />
      <Faq />
      <SiteFooter />
      <SeriesJsonLd />
    </>
  );
}
