"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef } from "react";
import type { ResultCase } from "@/content/results";
import { gsap } from "@/lib/gsap";

type Side = ResultCase["before"];

function Layer({ side, label, alt, placeholder, tone }: { side: Side; label: string; alt: string; placeholder: boolean; tone: "before" | "after" }) {
  if (placeholder || !side.src) {
    return (
      <div className={`absolute inset-0 ${tone === "before" ? "bg-[#d6cbbb]" : "bg-[#ebe4d8]"}`}>
        <p className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[2.6rem] italic text-charcoal/55 ${tone === "before" ? "left-1/4" : "left-3/4"}`}>
          {label}
        </p>
      </div>
    );
  }
  return <Image src={side.src} alt={alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" draggable={false} />;
}

/**
 * Drag (mouse or touch) or use the arrow keys to compare.
 * Vertical swipes still scroll the page on phones (touch-action: pan-y).
 */
export function CompareSlider({ item, hint = false }: { item: ResultCase; hint?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const id = useId();

  const setPos = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    wrap.current?.style.setProperty("--pos", `${clamped}%`);
    if (input.current) {
      input.current.value = String(Math.round(clamped));
      input.current.setAttribute("aria-valuetext", `${Math.round(clamped)}% after`);
    }
  }, []);

  const fromPointer = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect();
    setPos(((clientX - rect.left) / rect.width) * 100);
  };

  // A one-off sweep the first time it scrolls into view hints that it's interactive.
  useEffect(() => {
    if (!hint || !wrap.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wrap.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const state = { p: 50 };
        gsap
          .timeline({ delay: 0.4, onUpdate: () => !dragging.current && setPos(state.p) })
          .to(state, { p: 68, duration: 0.9, ease: "power2.inOut" })
          .to(state, { p: 36, duration: 1.1, ease: "power2.inOut" })
          .to(state, { p: 50, duration: 0.9, ease: "power2.inOut" });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hint, setPos]);

  const beforeAlt = `Before treatment — ${item.technique}`;
  const afterAlt = `After treatment — ${item.technique}, ${item.timeAfter}`;

  return (
    <div
      ref={wrap}
      className="group relative aspect-[4/5] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[1.25rem] bg-sand [--pos:50%]"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Layer side={item.before} label="Before" alt={beforeAlt} placeholder={item.placeholder} tone="before" />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 var(--pos))" }}>
        <Layer side={item.after} label="After" alt={afterAlt} placeholder={item.placeholder} tone="after" />
      </div>

      {item.placeholder && (
        <p className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg bg-ivory/85 px-3 py-2 text-center text-[0.62rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-bronze backdrop-blur">
          Placeholder · authentic patient photograph to be supplied
        </p>
      )}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ivory backdrop-blur">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ivory/85 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-charcoal backdrop-blur">
        After
      </span>

      <div className="pointer-events-none absolute inset-y-0 left-[var(--pos)] w-px -translate-x-1/2 bg-ivory shadow-[0_0_12px_rgb(0_0_0/0.25)]">
        <div className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ivory text-charcoal shadow-lg transition-transform duration-300 group-active:scale-90">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      <label htmlFor={id} className="sr-only">
        Compare before and after: {item.title}
      </label>
      <input
        ref={input}
        id={id}
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        onChange={(e) => setPos(Number(e.target.value))}
        className="peer sr-only"
      />
      <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-bronze ring-offset-2 peer-focus-visible:ring-2" />
    </div>
  );
}
