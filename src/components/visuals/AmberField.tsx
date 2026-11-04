"use client";

import { useEffect, useRef } from "react";
import { AMBER_FRAG, AMBER_VERT } from "./amber-shader";
import { AmberStill } from "./AmberStill";

export type AmberParams = {
  /** Light pool centre (0..1, origin bottom-left) and radius */
  x: number;
  y: number;
  r: number;
  gain: number;
  spread: number;
  scale: number;
};

type Variant = "hero" | "evening" | "page";

const PRESETS: Record<Variant, { wide: AmberParams; tall: AmberParams; introMs: number }> = {
  hero: {
    wide: { x: 0.76, y: 0.34, r: 1.12, gain: 1, spread: 0, scale: 2.3 },
    tall: { x: 0.66, y: 0.3, r: 1.05, gain: 0.95, spread: 0, scale: 2.1 },
    introMs: 0,
  },
  evening: {
    wide: { x: 0.74, y: 0.5, r: 1.0, gain: 0.85, spread: 0.35, scale: 2.2 },
    tall: { x: 0.6, y: 0.28, r: 1.0, gain: 0.85, spread: 0.35, scale: 2.0 },
    introMs: 0,
  },
  page: {
    wide: { x: 0.8, y: 0.4, r: 0.95, gain: 0.9, spread: 0, scale: 2.4 },
    tall: { x: 0.7, y: 0.32, r: 0.9, gain: 0.85, spread: 0, scale: 2.1 },
    introMs: 0,
  },
};

export type AmberController = {
  /** Current params; mutate or tween these and the next frame picks them up. */
  params: AmberParams;
  preset: () => AmberParams;
};

/** Lets the scroll choreography reach a field without React state. */
export const amberRegistry = new Map<string, AmberController>();

export function AmberField({ variant = "hero", id, className = "" }: { variant?: Variant; id?: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const preset = PRESETS[variant];
    const pick = () => (wrap.clientWidth >= wrap.clientHeight ? preset.wide : preset.tall);
    const controller: AmberController = { params: { ...pick() }, preset: pick };
    if (id) amberRegistry.set(id, controller);
    let landscape = wrap.clientWidth >= wrap.clientHeight;

    let gl: WebGLRenderingContext | null = null;
    let raf = 0;
    let disposed = false;
    let visible = true;
    let started = 0;
    let lastDraw = 0;
    let firstFrame = true;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const frameGap = coarse ? 1000 / 30 : 1000 / 60;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let program: WebGLProgram | null = null;
    let ext: { COMPLETION_STATUS_KHR: number } | null = null;

    /*
     * A pre-rendered frame of the light, drawn into a 2D canvas (never an LCP
     * candidate). Used with reduced motion and where the shader can't run.
     */
    const photo = photoRef.current;
    let bitmap: ImageBitmap | null = null;
    let photoWanted = false;
    const drawPhoto = () => {
      if (!photo || !bitmap) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(photo.clientWidth * dpr);
      const h = Math.round(photo.clientHeight * dpr);
      if (!w || !h) return;
      if (photo.width !== w || photo.height !== h) {
        photo.width = w;
        photo.height = h;
      }
      const ctx = photo.getContext("2d");
      if (!ctx) return;
      // Cover, anchored bottom-right like the vector still.
      const scale = Math.max(w / bitmap.width, h / bitmap.height);
      const dw = bitmap.width * scale;
      const dh = bitmap.height * scale;
      ctx.drawImage(bitmap, w - dw, h - dh, dw, dh);
      photo.classList.add("is-ready");
    };
    const loadPhoto = async () => {
      if (!photo || photoWanted || disposed) return;
      photoWanted = true;
      try {
        const res = await fetch("/amber/light.webp");
        if (!res.ok) return;
        bitmap = await createImageBitmap(await res.blob());
        if (!disposed) drawPhoto();
      } catch {
        // The vector still stays.
      }
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      mouse.ty = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    };

    const resize = () => {
      if (!gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * (coarse ? 0.5 : 0.6);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      // Keep the composition right when the field flips between landscape and portrait.
      const nowLandscape = wrap.clientWidth >= wrap.clientHeight;
      if (nowLandscape !== landscape) {
        landscape = nowLandscape;
        Object.assign(controller.params, pick());
      }
    };

    const draw = (now: number) => {
      if (!gl || !program) return;
      if (ext && firstFrame && !gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      if (firstFrame) {
        u = {
          res: gl.getUniformLocation(program, "uRes"),
          time: gl.getUniformLocation(program, "uTime"),
          intro: gl.getUniformLocation(program, "uIntro"),
          mouse: gl.getUniformLocation(program, "uMouse"),
          pool: gl.getUniformLocation(program, "uPool"),
          gain: gl.getUniformLocation(program, "uGain"),
          spread: gl.getUniformLocation(program, "uSpread"),
          scale: gl.getUniformLocation(program, "uScale"),
        };
        started = now;
      }
      if (!reduce && now - lastDraw < frameGap - 1) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      const p = controller.params;
      const introT = preset.introMs && !reduce ? Math.min(1, (now - started) / preset.introMs) : 1;
      const intro = 1 - Math.pow(1 - introT, 3);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, 8 + (reduce ? 0 : (now - started) / 1000));
      gl.uniform1f(u.intro, intro);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform3f(u.pool, p.x, p.y, p.r);
      gl.uniform1f(u.gain, p.gain);
      gl.uniform1f(u.spread, p.spread);
      gl.uniform1f(u.scale, p.scale);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (firstFrame) {
        firstFrame = false;
        canvas.classList.add("is-ready");
        // Once the live light has faded in, free the still underneath it.
        window.setTimeout(() => {
          if (disposed || !photo) return;
          photo.width = 0;
          photo.height = 0;
          photo.classList.remove("is-ready");
          bitmap?.close();
          bitmap = null;
        }, 1600);
      }
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (disposed) return;
      gl = canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
        // Software rendering (no GPU) would make the light slow and the page
        // janky, so those devices keep the static CSS light instead.
        failIfMajorPerformanceCaveat: !new URLSearchParams(location.search).has("forcegl"),
      });
      if (!gl) {
        loadPhoto(); // no fast GPU: show the pre-rendered light instead
        return;
      }
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      const forced = new URLSearchParams(location.search).has("forcegl"); // QA only
      if (!forced && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        gl = null;
        loadPhoto();
        return;
      }
      ext = gl.getExtension("KHR_parallel_shader_compile") as { COMPLETION_STATUS_KHR: number } | null;
      const vs = gl.createShader(gl.VERTEX_SHADER);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vs || !fs) return;
      gl.shaderSource(vs, AMBER_VERT);
      gl.shaderSource(fs, AMBER_FRAG);
      gl.compileShader(vs);
      gl.compileShader(fs);
      program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const check = () => {
        if (!gl || !program) return false;
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("AmberField:", gl.getShaderInfoLog(fs), gl.getProgramInfoLog(program));
          }
          program = null;
          return false;
        }
        gl.useProgram(program);
        const loc = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        return true;
      };
      const waitForCompile = () => {
        if (disposed || !gl || !program) return;
        if (ext && !gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
          raf = requestAnimationFrame(waitForCompile);
          return;
        }
        if (check()) raf = requestAnimationFrame(draw);
      };
      waitForCompile();
      if (!reduce && !coarse) window.addEventListener("pointermove", onPointer, { passive: true });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = entry.isIntersecting;
        if (visible && !was && program && !reduce) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        }
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      if (reduce && program) requestAnimationFrame(draw);
      if (bitmap) requestAnimationFrame(drawPhoto);
    });
    ro.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden && visible && program && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    /*
     * The live light starts on the first sign of a person (pointer, touch,
     * scroll, key) or after a quiet moment, never during page load. Until then
     * the vector still is on screen. With reduced motion it never starts.
     */
    let idleId = 0;
    let timer = 0;
    let wanted = false;
    let begun = false;
    const begin = () => {
      if (begun || disposed) return;
      begun = true;
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) idleId = ric(start, { timeout: 600 });
      else idleId = window.setTimeout(start, 60);
    };
    const want = () => {
      wanted = true;
      removeIntent();
      if (visible) begin();
    };
    const intents = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const removeIntent = () => intents.forEach((t) => window.removeEventListener(t, want));
    let photoIdle = 0;
    // Everyone gets the pre-rendered light shortly after load, so the hero is
    // never just a soft glow while waiting for the live shader.
    if (photo) {
      const later = () => {
        const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        photoIdle = ric ? ric(() => loadPhoto(), { timeout: 2000 }) : window.setTimeout(() => loadPhoto(), 300);
      };
      if (document.readyState === "complete") later();
      else window.addEventListener("load", later, { once: true });
    }
    if (!reduce) {
      intents.forEach((t) => window.addEventListener(t, want, { passive: true, once: true }));
      const arm = () => {
        timer = window.setTimeout(want, 7000);
      };
      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });
    }
    const io2 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && wanted) begin();
      },
      { rootMargin: "200px 0px" },
    );
    io2.observe(canvas);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      io2.disconnect();
      ro.disconnect();
      removeIntent();
      window.clearTimeout(timer);
      window.clearTimeout(photoIdle);
      bitmap?.close();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cic) cic(idleId);
      else window.clearTimeout(idleId);
      if (id) amberRegistry.delete(id);
      const lose = gl?.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, [variant, id]);

  return (
    <div ref={wrapRef} className={`amber-field ${className}`} aria-hidden="true">
      <AmberStill align={variant === "evening" ? "center" : "right"} />
      {variant !== "evening" ? <canvas ref={photoRef} className="amber-photo" /> : null}
      <canvas ref={canvasRef} className="amber-gl" />
    </div>
  );
}
