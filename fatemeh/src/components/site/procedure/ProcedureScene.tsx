"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildScalp, type Scalp } from "@/lib/scalp";
import { gsap, markMotionReady, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CHAPTERS, draw, prepare } from "./render";
import { setImmersive } from "@/lib/immersive";
import { useNear } from "@/lib/useNear";

const STEPS = [
  {
    kicker: "Assessment",
    title: "Mapping your hair",
    body: "Your photographs are studied area by area: where hair is thinning, how it's progressing, and how much donor hair you can spare.",
  },
  {
    kicker: "Design",
    title: "Drawing the hairline",
    body: "A hairline is designed for your face and age, with a soft, irregular edge rather than a straight line. The crown is planned with realistic coverage in mind.",
  },
  {
    kicker: "Extraction",
    title: "Taking each graft",
    body: "Under local anaesthetic, follicular units of one to three hairs are taken one by one, spaced out so the donor area keeps its density.",
  },
  {
    kicker: "Implantation",
    title: "Placing every follicle",
    body: "Each graft follows your natural growth direction. Single hairs form the very front of the hairline; fuller grafts sit behind for density.",
  },
  {
    kicker: "Growth",
    title: "Growing in, over months",
    body: "Transplanted hairs usually shed first, then regrow over the following months. Every person's timeline is different.",
  },
];

const TIMELINE = [
  { at: 0, label: "Day 1" },
  { at: 0.22, label: "Weeks 2–6", note: "shedding" },
  { at: 0.45, label: "Months 3–6", note: "new growth" },
  { at: 0.95, label: "12 months +", note: "maturing" },
];

const chapterAt = (p: number) => {
  for (let i = 4; i >= 0; i--) if (p >= CHAPTERS[i] - 0.001) return i;
  return 0;
};

function useCanvas(canvas: React.RefObject<HTMLCanvasElement | null>, onSize: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onSize(ctx, r.width, r.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas, onSize]);
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.7rem] text-on-dark-muted">
      <span className="flex items-center gap-2">
        <span className="h-px w-4 bg-[#e9e1d4]" /> Existing hair
      </span>
      <span className="flex items-center gap-2">
        <span className="h-[2px] w-4 bg-bronze-soft" /> Transplanted grafts
      </span>
      <span className="italic">Illustration, not to scale</span>
    </div>
  );
}

export function ProcedureScene() {
  const [mode, setMode] = useState<"scene" | "story">("scene");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMode(mq.matches ? "story" : "scene");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const scalp = useMemo(() => buildScalp("both"), []);
  return mode === "scene" ? <Scene key="scene" scalp={scalp} /> : <Storyboard key="story" scalp={scalp} />;
}

/** Pinned, scroll-scrubbed version. */
function Scene({ scalp }: { scalp: Scalp }) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const near = useNear(root);

  useGSAP(
    () => {
      if (!near) return;
      markMotionReady();
      const el = canvas.current!;
      const ctx = el.getContext("2d")!;
      const cache = prepare(scalp);
      const state = { p: 0, intro: 0 };
      let w = 0;
      let h = 0;
      let raf = 0;
      const render = () => {
        raf = 0;
        if (w && h) draw(ctx, w, h, state.p, state.intro, scalp, cache);
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(render);
      };
      const resize = () => {
        const r = el.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = r.width;
        h = r.height;
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        render();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      ScrollTrigger.config({ ignoreMobileResize: true });

      // The outline draws itself as the section arrives…
      gsap.to(state, {
        intro: 1,
        ease: "none",
        onUpdate: schedule,
        scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 10%", scrub: 0.5 },
      });
      // …then the procedure plays as you scroll through the pinned scene.
      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => {
          schedule();
          const i = chapterAt(state.p);
          setActive((prev) => (prev === i ? prev : i));
          const g = Math.min(1, Math.max(0, (state.p - CHAPTERS[4]) / (1 - CHAPTERS[4])));
          root.current?.style.setProperty("--growth", g.toFixed(3));
        },
        // The section is tall and its stage is CSS-sticky: no GSAP pinning,
        // so no layout reflow and no jitter on iPhone.
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onToggle: (self) => setImmersive(self.isActive),
        },
      });
      trigger.current = tween.scrollTrigger ?? null;

      return () => {
        if (tween.scrollTrigger?.isActive) setImmersive(false);
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    },
    { scope: root, dependencies: [near] },
  );

  const jumpTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const at = CHAPTERS[i] + (CHAPTERS[i + 1] - CHAPTERS[i]) * 0.7;
    window.scrollTo({ top: st.start + (st.end - st.start) * at, behavior: "smooth" });
  };

  return (
    <section ref={root} id="procedure" aria-labelledby="procedure-title" className="on-dark relative h-[500svh] bg-[#141311] text-on-dark [--growth:0] lg:h-[600svh]">
      <div className="sticky top-0">
        <div ref={pin} className="grain relative h-[100svh] overflow-hidden">
          <div className="container-site relative z-10 flex h-full flex-col pb-5 pt-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-4 lg:pt-24">
            {/* Copy */}
            <div className="order-2 lg:order-1 lg:col-span-5">
              <p className="eyebrow eyebrow-on-dark hidden lg:block">The procedure</p>
              <h2 id="procedure-title" className="display mt-5 hidden text-[clamp(2.4rem,4.4vw,4.2rem)] lg:block">
                Follicle by <em>follicle.</em>
              </h2>

              <div className="relative mt-3 min-h-[9.5rem] lg:mt-12 lg:min-h-[13rem]">
                {STEPS.map((s, i) => (
                  <div
                    key={s.title}
                    aria-hidden={active !== i}
                    className={`absolute inset-x-0 top-0 transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)] ${
                      active === i ? "translate-y-0 opacity-100" : active > i ? "-translate-y-3 opacity-0" : "translate-y-3 opacity-0"
                    }`}
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bronze-soft">
                      0{i + 1} · {s.kicker}
                    </p>
                    <h3 className="mt-2 font-display text-[1.75rem] leading-tight lg:text-[2.4rem]">{s.title}</h3>
                    <p className="mt-2 max-w-md text-[0.92rem] leading-relaxed text-on-dark-muted lg:mt-3 lg:text-base">{s.body}</p>
                    {i === 4 && (
                      <div className="mt-4 max-w-md lg:mt-6">
                        <div className="relative h-px bg-on-dark/15">
                          <div className="absolute inset-y-0 left-0 w-full origin-left scale-x-[var(--growth)] bg-bronze-soft" />
                        </div>
                        <ol className="mt-2 grid grid-cols-4 text-[0.62rem] leading-tight text-on-dark-muted lg:text-[0.7rem]">
                          {TIMELINE.map((t) => (
                            <li key={t.label}>
                              <span className="block font-semibold text-on-dark">{t.label}</span>
                              {t.note}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chapter rail: also lets keyboard and switch users jump between steps */}
              <nav aria-label="Procedure steps" className="mt-4 flex items-center gap-1.5 lg:mt-10">
                {STEPS.map((s, i) => (
                  <button
                    key={s.kicker}
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={active === i ? "step" : undefined}
                    className="group flex min-h-11 flex-1 flex-col justify-center gap-2 text-left"
                  >
                    <span className={`h-[2px] w-full rounded-full transition-colors duration-500 ${i <= active ? "bg-bronze-soft" : "bg-on-dark/15 group-hover:bg-on-dark/40"}`} />
                    <span className={`hidden text-[0.65rem] uppercase tracking-[0.16em] transition-colors sm:block ${i === active ? "text-on-dark" : "text-on-dark-muted"}`}>{s.kicker}</span>
                    <span className="sr-only sm:hidden">{s.kicker}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-4 hidden lg:block">
                <Legend />
              </div>
            </div>

            {/* Scene */}
            <div className="relative order-1 -mx-5 min-h-0 flex-1 lg:order-2 lg:col-span-7 lg:mx-0 lg:h-full">
              <p className="eyebrow eyebrow-on-dark absolute left-5 top-0 z-10 lg:hidden">The procedure · follicle by follicle</p>
              <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
              <div className="absolute bottom-0 left-5 lg:hidden">
                <Legend />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Screen-reader summary of the whole animation */}
      <ol className="sr-only">
        {STEPS.map((s) => (
          <li key={s.title}>
            {s.kicker}: {s.title}. {s.body}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Reduced-motion version: the same story as five still frames, no pinning. */
function Storyboard({ scalp }: { scalp: Scalp }) {
  return (
    <section id="procedure" aria-labelledby="procedure-title" className="on-dark grain bg-[#141311] py-24 text-on-dark md:py-32">
      <div className="container-site relative z-10">
        <p className="eyebrow eyebrow-on-dark">The procedure</p>
        <h2 id="procedure-title" className="display mt-5 text-[clamp(2.4rem,4.4vw,4.2rem)]">
          Follicle by <em>follicle.</em>
        </h2>
        <div className="mt-6">
          <Legend />
        </div>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <StillFrame scalp={scalp} p={CHAPTERS[i + 1] - 0.005} />
              <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bronze-soft">
                0{i + 1} · {s.kicker}
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-dark-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StillFrame({ scalp, p }: { scalp: Scalp; p: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const paint = useMemo(() => {
    const cache = prepare(scalp);
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => draw(ctx, w, h, p, 1, scalp, cache);
  }, [scalp, p]);
  useCanvas(canvas, paint);
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#1b1a17]">
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
