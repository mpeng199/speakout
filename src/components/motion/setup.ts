import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { amberRegistry } from "@/components/visuals/AmberField";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** House curve: quart out. Precise, never springy. */
const EASE = "quart.out";

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

export function getLenis() {
  return lenis;
}

const onMenu = (e: Event) => {
  if ((e as CustomEvent<boolean>).detail) lenis?.stop();
  else lenis?.start();
};

function startLenis() {
  if (lenis) return lenis;
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, autoRaf: false });
  window.addEventListener("speakout:menu", onMenu);
  lenis.on("scroll", ScrollTrigger.update);
  tickerFn = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function teardownLenis() {
  window.removeEventListener("speakout:menu", onMenu);
  if (tickerFn) gsap.ticker.remove(tickerFn);
  lenis?.destroy();
  lenis = null;
  tickerFn = null;
}

const navHeight = () => (document.querySelector<HTMLElement>("[data-site-nav]")?.offsetHeight ?? 72) - 1;

/* ───────────────────────────── In-page links ───────────────────────────── */

function smoothAnchors(reduce: boolean) {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href*='#']");
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    const focusTarget = () => {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    history.pushState(null, "", url.hash);
    if (lenis && !reduce) {
      lenis.scrollTo(target, { offset: url.hash === "#top" ? 0 : -navHeight() + 1, duration: 1.2, onComplete: focusTarget });
    } else {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navHeight(), behavior: "auto" });
      focusTarget();
    }
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/* ───────────────────────────── Navigation theme ───────────────────────────── */

function navTheme(reduce: boolean) {
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  if (!nav) return () => {};
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));
  const triggers: ScrollTrigger[] = [];
  sections.forEach((section) => {
    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${navHeight() / 2}`,
        end: () => `bottom top+=${navHeight() / 2}`,
        onToggle: (self) => {
          if (self.isActive) nav.dataset.theme = section.dataset.navTheme;
        },
      }),
    );
  });
  // Hide on scroll down, show on scroll up.
  if (!reduce) {
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const menuOpen = document.documentElement.classList.contains("menu-open");
          const focusInside = nav.contains(document.activeElement);
          nav.classList.toggle("is-hidden", !menuOpen && !focusInside && self.direction === 1 && y > window.innerHeight * 0.6);
          nav.classList.toggle("is-scrolled", y > 8);
        },
      }),
    );
  }
  return () => triggers.forEach((t) => t.kill());
}

/* ───────────────────────────── Line reveals ───────────────────────────── */

/**
 * Text is only split when it gets close to the viewport, so the page does
 * almost no work on load. Each block is prepared just below the fold, then
 * its lines rise in when it scrolls into view.
 */
function lineReveals() {
  const splits: SplitText[] = [];
  const prep = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        prep.unobserve(el);
        const delay = Number(el.dataset.revealDelay ?? 0);
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          // Only lines are wrapped, so the words stay intact for screen readers;
          // no aria-label is needed (and a label on a <p> is not allowed).
          aria: "none",
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 108,
              duration: 0.9,
              ease: EASE,
              stagger: 0.07,
              delay,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          },
        });
        splits.push(split);
      });
    },
    { rootMargin: "0px 0px 45% 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-reveal='lines']").forEach((el) => {
    // Anything already on screen when the motion layer loads stays as it is.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return;
    prep.observe(el);
  });
  return () => {
    prep.disconnect();
    splits.forEach((s) => s.revert());
  };
}

/** The footer wordmark: each letter rises out of its mask, left to right. */
function charReveals() {
  const splits: SplitText[] = [];
  document.querySelectorAll<HTMLElement>("[data-reveal='chars']").forEach((el) => {
    splits.push(
      SplitText.create(el, {
        type: "chars",
        mask: "chars",
        charsClass: "split-char",
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 105,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          });
        },
      }),
    );
  });
  return () => splits.forEach((s) => s.revert());
}

function fades() {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll<HTMLElement>("[data-reveal='fade']").forEach((el) => {
    tweens.push(
      gsap.from(el, {
        y: 22,
        opacity: 0,
        duration: 0.9,
        ease: EASE,
        delay: Number(el.dataset.revealDelay ?? 0),
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      }),
    );
  });
  document.querySelectorAll<HTMLElement>("[data-reveal='stagger']").forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    tweens.push(
      gsap.from(items, {
        y: 26,
        opacity: 0,
        duration: 0.85,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }),
    );
  });
  // Label cards print row by row, like a pharmacy label coming out of the printer.
  const arrivedByMorph = document.documentElement.dataset.navigated === "true";
  document.querySelectorAll<HTMLElement>("[data-reveal='print']").forEach((card) => {
    if (arrivedByMorph && card.classList.contains("vt-label")) return;
    const rows = card.querySelectorAll<HTMLElement>("[data-print]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 86%", once: true } });
    tl.from(card, { y: 24, opacity: 0, duration: 0.7, ease: EASE });
    tl.from(rows, { clipPath: "inset(0 100% 0 0)", duration: 0.45, ease: EASE, stagger: 0.06 }, 0.15);
  });
  return () => tweens.forEach((t) => t.scrollTrigger?.kill());
}

/* ───────────────────────────── Parallax ───────────────────────────── */

function parallax() {
  const tweens: gsap.core.Tween[] = [];
  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax || 10);
    tweens.push(
      gsap.fromTo(
        el,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      ),
    );
  });
  // The hero light drifts up a little slower than the page.
  document.querySelectorAll<HTMLElement>("[data-parallax-out]").forEach((el) => {
    tweens.push(
      gsap.to(el, {
        yPercent: Number(el.dataset.parallaxOut || 18),
        ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top top", end: "bottom top", scrub: true },
      }),
    );
  });
  return () => tweens.forEach((t) => t.scrollTrigger?.kill());
}

/* ───────────────────────────── Magnetic buttons ───────────────────────────── */

function magnetic() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const inner = el.querySelector<HTMLElement>(".magnetic-inner");
    const strength = Number(el.dataset.magnetic || 0.32);
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" }) : null;
    const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" }) : null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.45);
      iyTo?.(dy * strength * 0.45);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set([el, inner].filter(Boolean), { x: 0, y: 0 });
    });
  });
  return () => offs.forEach((f) => f());
}

/* ───────────────────────────── The evening (pinned sequence) ───────────────────────────── */

function evening() {
  const section = document.querySelector<HTMLElement>("[data-evening]");
  if (!section) return () => {};
  const stage = section.querySelector<HTMLElement>("[data-evening-stage]");
  const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
  const bars = Array.from(section.querySelectorAll<HTMLElement>("[data-progress-bar]"));
  const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-progress-item]"));
  const counter = section.querySelector<HTMLElement>("[data-step-counter]");
  if (!stage || steps.length < 2) return () => {};

  section.dataset.pinned = "true";
  const field = amberRegistry.get("evening");
  const base = field?.preset() ?? { x: 0.74, y: 0.5, r: 1, gain: 0.85, spread: 0.35, scale: 2.2 };
  const landscape = stage.clientWidth >= stage.clientHeight;
  // Lighting cues: house lights → a spotlight for the talk → the room lights up.
  const cues = [
    { ...base, r: landscape ? 1.05 : 1.0, gain: 0.8, spread: 0.32, scale: 2.2 },
    { ...base, x: landscape ? 0.72 : 0.56, y: landscape ? 0.56 : 0.34, r: landscape ? 0.48 : 0.62, gain: 1.35, spread: 0, scale: 2.7 },
    { ...base, x: 0.5, y: 0.5, r: 1.6, gain: 1.05, spread: 0.95, scale: 1.8 },
  ];
  if (field) Object.assign(field.params, cues[0]);
  const still = section.querySelector<SVGGElement>(".amber-still-glow");
  const stillCues = [
    { scale: 1, x: 0, y: 0, opacity: 1 },
    { scale: 0.56, x: landscape ? 140 : 0, y: landscape ? -40 : 80, opacity: 1 },
    { scale: 1.7, x: 0, y: 0, opacity: 0.9 },
  ];
  // Tween a plain object and write the SVG transform ourselves (scale around the glow centre).
  const glow = { ...stillCues[0] };
  const cx = Number(still?.dataset.cx ?? 960);
  const cy = Number(still?.dataset.cy ?? 560);
  const paintGlow = () => {
    if (!still) return;
    still.setAttribute("transform", `translate(${cx + glow.x} ${cy + glow.y}) scale(${glow.scale}) translate(${-cx} ${-cy})`);
    still.style.opacity = String(glow.opacity);
  };
  paintGlow();

  // Opacity only (no visibility/aria changes), so every step stays available to screen readers.
  gsap.set(steps.slice(1), { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * steps.length * 0.95}`,
      pin: stage,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999));
        if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      },
    },
  });

  bars.forEach((bar, i) => {
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, i);
  });

  // Each step owns one unit of the timeline. Changes are centred on the unit
  // boundary and overlap, so there is never a blank frame between steps.
  for (let i = 1; i < steps.length; i++) {
    const at = i - 0.16;
    const outgoing = steps[i - 1];
    const incoming = steps[i];
    const outLines = outgoing.querySelectorAll("[data-step-line]");
    const inLines = incoming.querySelectorAll("[data-step-line]");
    tl.to(outLines, { yPercent: -36, opacity: 0, duration: 0.2, stagger: 0.02, ease: "power2.in" }, at);
    tl.set(outgoing, { opacity: 0 }, at + 0.26);
    tl.set(incoming, { opacity: 1 }, at + 0.12);
    tl.fromTo(inLines, { yPercent: 56, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: EASE }, at + 0.12);
    if (field) {
      tl.to(field.params, { ...cues[i], duration: 0.6, ease: "power2.inOut" }, at - 0.1);
    }
    // The vector still follows the same cues where the shader is not running.
    if (still) {
      tl.to(glow, { ...stillCues[i], duration: 0.6, ease: "power2.inOut", onUpdate: paintGlow }, at - 0.1);
    }
  }

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    delete section.dataset.pinned;
    gsap.set(steps, { clearProps: "all" });
    if (still) {
      still.removeAttribute("transform");
      still.style.opacity = "";
    }
  };
}

/* ───────────────────────────── Fit text (footer wordmark) ───────────────────────────── */

function fitText() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-fit]"));
  if (!els.length) return () => {};
  const fit = () => {
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const target = parent.clientWidth;
      if (w > 0) el.style.fontSize = `${Math.floor((100 * target) / w) - 0.5}px`;
    });
  };
  fit();
  document.fonts?.ready.then(fit);
  const ro = new ResizeObserver(fit);
  els.forEach((el) => el.parentElement && ro.observe(el.parentElement));
  return () => ro.disconnect();
}

/* ───────────────────────────── Entry ───────────────────────────── */

/** Gives the browser a chance to paint and respond between setup steps. */
const yieldToMain = () =>
  new Promise<void>((resolve) => {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (s?.yield) s.yield().then(resolve);
    else setTimeout(resolve, 0);
  });

export function setupMotion({ reduce }: { reduce: boolean }) {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const cleanups: (() => void)[] = [];
  let cancelled = false;

  const steps: (() => (() => void) | void)[] = reduce
    ? [() => teardownLenis(), () => smoothAnchors(reduce), () => navTheme(reduce), () => fitText()]
    : [
        () => {
          startLenis();
        },
        () => smoothAnchors(reduce),
        () => navTheme(reduce),
        () => fitText(),
        () => magnetic(),
        () => evening(),
        () => parallax(),
        () => fades(),
        () => lineReveals(),
        () => charReveals(),
      ];

  (async () => {
    for (const step of steps) {
      if (cancelled) return;
      const off = step();
      if (off) cleanups.push(off);
      await yieldToMain();
    }
    if (cancelled) return;
    ScrollTrigger.refresh();
    // Land on a hash target once pinning has changed the page height
    // (e.g. /#faq from another page). Runs again a frame later so it wins
    // over the router's own scroll.
    const land = () => {
      if (cancelled || !location.hash) return;
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - (target.id === "top" ? 0 : navHeight()));
      lenis?.resize();
      window.scrollTo(0, top);
      lenis?.scrollTo(top, { immediate: true, force: true });
    };
    land();
    requestAnimationFrame(() => requestAnimationFrame(land));
  })();


  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", refresh);
    cleanups.reverse().forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}
