"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { caseFrames, PLACEHOLDER_NOTE, RESULTS, type ResultCase } from "@/content/results";
import { gsap, markMotionReady, useGSAP } from "@/lib/gsap";
import { setImmersive } from "@/lib/immersive";
import { useNear } from "@/lib/useNear";
import { CompareSlider } from "./CompareSlider";

const CaseStudio = dynamic(() => import("./studio/CaseStudio").then((m) => m.CaseStudio), { ssr: false });

/**
 * Featured transformation. While pinned, scrolling wipes through every stage
 * of one case (before → months → after). Under reduced motion it becomes a
 * normal before/after slider with no pinning.
 */
export function FeaturedCase({ item }: { item: ResultCase }) {
  const [reduced, setReduced] = useState(false);
  const [studio, setStudio] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const openStudio = (
    <button
      type="button"
      onClick={() => setStudio(Math.max(0, RESULTS.indexOf(item)))}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-on-dark/25 px-5 text-sm transition hover:border-on-dark hover:bg-on-dark hover:text-charcoal"
    >
      Open in case studio
    </button>
  );
  const studioEl =
    studio !== null ? (
      <CaseStudio cases={RESULTS} index={studio} origin={frameRef.current?.getBoundingClientRect() ?? null} onIndex={setStudio} onClose={() => setStudio(null)} />
    ) : null;

  return (
    <>
      {reduced ? <StaticFeature item={item} frameRef={frameRef} cta={openStudio} /> : <PinnedFeature item={item} frameRef={frameRef} cta={openStudio} />}
      {studioEl}
    </>
  );
}

function Meta({ item }: { item: ResultCase }) {
  return (
    <dl className="grid grid-cols-3 gap-4 border-y border-on-dark/10 py-4 text-sm lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-on-dark/10 lg:py-0">
      {(
        [
          ["Technique", item.technique],
          ["Grafts", item.grafts],
          ["Photographed", item.timeAfter],
        ] as const
      )
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="lg:flex lg:justify-between lg:py-3">
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-on-dark-muted lg:text-sm lg:normal-case lg:tracking-normal">{k}</dt>
            <dd className="mt-1 lg:mt-0">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

function PinnedFeature({ item, frameRef, cta }: { item: ResultCase; frameRef: React.RefObject<HTMLDivElement | null>; cta: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const frames = caseFrames(item);
  const n = frames.length;
  const [stage, setStage] = useState(0);
  const near = useNear(outer);

  useGSAP(
    () => {
      if (!near) return;
      markMotionReady();
      const layers = gsap.utils.toArray<HTMLElement>("[data-wipe-layer]");
      const line = root.current!.querySelector<HTMLElement>("[data-wipe-line]")!;
      const words = gsap.utils.toArray<HTMLElement>("[data-wipe-word]");
      const state = { p: 0 };
      const update = () => {
        const v = state.p * (n - 1); // 0 … n-1
        layers.forEach((el, k) => {
          // layer k (1-based stage) sweeps in from the left during segment k-1 → k
          const t = Math.min(1, Math.max(0, v - k));
          el.style.clipPath = `inset(0 ${(100 - t * 100).toFixed(2)}% 0 0)`;
        });
        const seg = Math.min(n - 2, Math.floor(v));
        const t = v - seg;
        const moving = t > 0.001 && t < 0.999 && v < n - 1;
        line.style.opacity = moving ? "1" : "0";
        line.style.left = `${(t * 100).toFixed(2)}%`;
        const cur = Math.min(n - 1, Math.round(v));
        setStage((s) => (s === cur ? s : cur));
        words.forEach((w, i) => (w.style.opacity = String(Math.max(0, 1 - Math.abs(v - i)) * 0.06)));
        root.current?.style.setProperty("--feature", state.p.toFixed(3));
      };
      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: update,
        // Tall wrapper + CSS-sticky stage instead of GSAP pinning.
        scrollTrigger: {
          trigger: outer.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onToggle: (self) => setImmersive(self.isActive),
          onLeave: update,
        },
      });
      update();
      return () => {
        if (tween.scrollTrigger?.isActive) setImmersive(false);
      };
    },
    { scope: root, dependencies: [near] },
  );

  return (
    <div>
      <div ref={outer} className="relative" style={{ height: `${100 + (n - 1) * 85}svh` }}>
      <div ref={root} className="sticky top-0 h-[100svh] overflow-hidden [--feature:0]">
        {/* Huge background words that cross-fade with the stages */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden lg:left-[30%]">
          {frames.map((f, i) => (
            <span key={f.label} data-wipe-word className="font-display absolute whitespace-nowrap text-[22vw] italic leading-none text-on-dark" style={{ opacity: i === 0 ? 0.06 : 0 }}>
              {f.label}
            </span>
          ))}
        </div>

        <div className="container-site relative flex h-full flex-col gap-4 pb-6 pt-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-8 lg:pt-24">
          <div className="order-2 lg:order-1 lg:col-span-4">
            <p className="eyebrow eyebrow-on-dark hidden lg:block">Featured transformation</p>
            <h3 className="mt-4 hidden font-display text-[2.6rem] leading-tight lg:block">{item.placeholder ? "Patient result" : item.title}</h3>
            {/* Stage rail */}
            <ol className="flex gap-1.5 lg:mt-8" aria-label="Stages">
              {frames.map((f, i) => (
                <li key={f.label} className="flex-1">
                  <span className="block h-[2px] overflow-hidden rounded-full bg-on-dark/15">
                    <span className={`block h-full bg-bronze-soft transition-transform duration-500 ${i <= stage ? "translate-x-0" : "-translate-x-full"}`} />
                  </span>
                  <span className={`mt-2 block text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${i === stage ? "text-on-dark" : "text-on-dark-muted"}`}>{f.label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 lg:mt-8">
              <Meta item={item} />
            </div>
            <div className="mt-4 hidden lg:mt-8 lg:block">{cta}</div>
          </div>

          <div className="relative order-1 flex min-h-0 flex-1 items-center justify-center lg:order-2 lg:col-span-8 lg:h-full">
            <p className="eyebrow eyebrow-on-dark absolute left-0 top-0 z-10 lg:hidden">Featured transformation</p>
            <div ref={frameRef} className="relative mt-7 aspect-[4/5] h-full max-h-full max-w-full overflow-hidden rounded-[1.25rem] bg-[#1b1a17] shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)] lg:mt-0">
              {frames.map((f, i) => (
                <div key={f.image.src} data-wipe-layer={i > 0 ? "" : undefined} className="absolute inset-0" style={i > 0 ? { clipPath: "inset(0 100% 0 0)" } : undefined}>
                  <Image src={f.image.src} alt={`${f.label}${item.placeholder ? " (illustration)" : ""}`} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
                </div>
              ))}
              <div data-wipe-line className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-ivory opacity-0 shadow-[0_0_20px_rgb(233_225_212/0.6)]" />
              <p className="absolute left-3 top-3 rounded-full bg-[#141311]/75 px-3 py-1.5 font-display text-lg text-ivory backdrop-blur" aria-live="polite">
                {frames[stage].label}
              </p>
              {item.placeholder && (
                <p className="absolute inset-x-3 bottom-3 rounded-lg bg-[#141311]/75 px-3 py-2 text-center text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-bronze-soft backdrop-blur">
                  {PLACEHOLDER_NOTE}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="container-site mt-6 lg:hidden">{cta}</div>
    </div>
  );
}

function StaticFeature({ item, frameRef, cta }: { item: ResultCase; frameRef: React.RefObject<HTMLDivElement | null>; cta: React.ReactNode }) {
  return (
    <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-4">
        <p className="eyebrow eyebrow-on-dark">Featured transformation</p>
        <h3 className="mt-4 font-display text-[2.4rem] leading-tight">{item.placeholder ? "Patient result" : item.title}</h3>
        <div className="mt-6">
          <Meta item={item} />
        </div>
        <div className="mt-6">{cta}</div>
      </div>
      <div ref={frameRef} className="mx-auto w-full max-w-xl lg:col-span-8">
        <CompareSlider item={item} sizes="(min-width: 1024px) 45vw, 100vw" />
      </div>
    </div>
  );
}
