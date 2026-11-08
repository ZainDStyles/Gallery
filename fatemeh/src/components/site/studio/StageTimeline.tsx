"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ResultImage } from "@/content/results";
import { gsap } from "@/lib/gsap";

/**
 * Scrub through the months: before → progress photos → after, cross-fading
 * between neighbouring stages. Play runs through them; each label is also a
 * button, so no dragging is ever required.
 */
export function StageTimeline({ frames, placeholder }: { frames: { label: string; image: ResultImage }[]; placeholder: boolean }) {
  const [v, setV] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tween = useRef<gsap.core.Tween | null>(null);
  const id = useId();
  const last = frames.length - 1;

  useEffect(() => () => void tween.current?.kill(), []);

  const play = () => {
    tween.current?.kill();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { v: v >= last ? 0 : v };
    setPlaying(true);
    tween.current = gsap.to(state, {
      v: last,
      duration: reduce ? 0.01 : 1.4 * (last - state.v),
      ease: "none",
      snap: reduce ? { v: 1 } : undefined,
      onUpdate: () => setV(state.v),
      onComplete: () => setPlaying(false),
    });
  };
  const stop = () => {
    tween.current?.kill();
    setPlaying(false);
  };

  const current = Math.round(v);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="relative mx-auto aspect-[4/5] min-h-0 max-w-full flex-1 overflow-hidden rounded-xl bg-[#1b1a17]">
        {frames.map((f, i) => (
          <div key={f.image.src} className="absolute inset-0" style={{ opacity: Math.max(0, 1 - Math.abs(v - i)) }} aria-hidden={i !== current}>
            <Image src={f.image.src} alt={`${f.label}${placeholder ? " (illustration)" : ""}`} fill loading="eager" sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>
        ))}
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#141311]/75 px-3 py-1.5 font-display text-lg text-ivory backdrop-blur" aria-live="polite">
          {frames[current].label}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={playing ? stop : play}
          aria-label={playing ? "Pause" : "Play through the months"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-ivory text-charcoal transition hover:bg-white"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4 translate-x-px" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <label htmlFor={id} className="sr-only">
            Time since treatment
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={last}
            step={0.01}
            value={v}
            onChange={(e) => {
              stop();
              setV(Number(e.target.value));
            }}
            aria-valuetext={frames[current].label}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-on-dark/20 accent-[#c9a27a]"
          />
          <ol className="mt-2 flex justify-between">
            {frames.map((f, i) => (
              <li key={f.label}>
                <button
                  type="button"
                  onClick={() => {
                    stop();
                    setV(i);
                  }}
                  aria-current={current === i ? "step" : undefined}
                  className={`min-h-9 text-[0.68rem] uppercase tracking-[0.14em] transition-colors ${current === i ? "text-bronze-soft" : "text-on-dark-muted hover:text-on-dark"}`}
                >
                  {f.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
