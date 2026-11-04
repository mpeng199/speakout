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
import { ViewTransition } from "react";
import { Motion } from "@/components/motion/Motion";
import { copy } from "@/content/series";

export default function Home() {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>
      {/* On tall desktop screens the hero stays put while "What it is" slides over it */}
      <div className="hero-stack">
        <Hero />
        <About />
      </div>
      <Evening />
      <Topics />
      <Events />
      <Speakers />
      <Researchers />
      <Faq />
      <SiteFooter />
      {/* Phones: once the hero has gone by, the signup waits at the bottom of the screen (shown by the motion layer) */}
      <a href="#signup" className="btn btn-amber signup-pill" data-signup-pill>
        <span>{copy.hero.cta}</span>
        <span className="arrow-down" aria-hidden="true">
          ↓
        </span>
      </a>
      <SeriesJsonLd />
      {/* Last on the page, so motion only starts once everything above has hydrated */}
      <Motion />
      </div>
    </ViewTransition>
  );
}
