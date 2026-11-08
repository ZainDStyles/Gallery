"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { caseFrames, PLACEHOLDER_NOTE, type ResultCase } from "@/content/results";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowRight, Close } from "@/components/ui/icons";
import { CompareSlider } from "../CompareSlider";
import { SyncedLoupe } from "./SyncedLoupe";
import { StageTimeline } from "./StageTimeline";

type Mode = "compare" | "side" | "timeline";
const MODES: { key: Mode; label: string; hint: string }[] = [
  { key: "compare", label: "Compare", hint: "Drag across" },
  { key: "side", label: "Side by side", hint: "Magnify the same spot" },
  { key: "timeline", label: "Timeline", hint: "Month by month" },
];

/**
 * Full-screen case viewer. Opens from the card with a FLIP-style expansion,
 * traps focus, closes on Esc, ←/→ move between cases (buttons and swipe too),
 * 1/2/3 switch views, and the URL hash (#case=…) makes each case linkable.
 */
export function CaseStudio({
  cases,
  index,
  origin,
  onIndex,
  onClose,
}: {
  cases: ResultCase[];
  index: number;
  origin: DOMRect | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("compare");
  const dialog = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const item = cases[index];
  const frames = caseFrames(item);

  const go = useCallback((dir: 1 | -1) => onIndex((index + dir + cases.length) % cases.length), [index, cases.length, onIndex]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(dialog.current, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power2.in", onComplete: onClose });
  }, [onClose]);

  // Opening animation: the stage grows out of the card that was clicked.
  // useGSAP reverts cleanly, so React's development double-run can't leave
  // anything stuck half-animated.
  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline();
      tl.fromTo(dialog.current, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.35, ease: "power2.out" });
      if (reduce || !stage.current) return;
      if (origin) {
        const to = stage.current.getBoundingClientRect();
        tl.fromTo(
          stage.current,
          {
            x: origin.left + origin.width / 2 - (to.left + to.width / 2),
            y: origin.top + origin.height / 2 - (to.top + to.height / 2),
            scale: Math.min(origin.width / to.width, origin.height / to.height),
          },
          { x: 0, y: 0, scale: 1, duration: 0.8, ease: "expo.inOut", clearProps: "transform" },
          0,
        );
      }
      tl.fromTo("[data-studio-chrome]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }, 0.45);
    },
    { scope: dialog },
  );

  // Scroll lock, focus management, keyboard.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.getAttribute("role") === "group";
      if (e.key === "Escape") return close();
      if (!typing && e.key === "ArrowRight") go(1);
      if (!typing && e.key === "ArrowLeft") go(-1);
      if (!typing && ["1", "2", "3"].includes(e.key)) setMode(MODES[Number(e.key) - 1].key);
      if (e.key === "Tab" && dialog.current) {
        const focusables = [...dialog.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [close, go]);

  // Swipe between cases on the info panel / header (not on the photos themselves).
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swipeProps = {
    onPointerDown: (e: React.PointerEvent) => (swipe.current = { x: e.clientX, y: e.clientY }),
    onPointerUp: (e: React.PointerEvent) => {
      const s = swipe.current;
      swipe.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
    },
  };

  const meta: [string, string | undefined][] = [
    ["Technique", item.technique],
    ["Grafts", item.grafts],
    ["Photographed", item.timeAfter],
  ];

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Case ${index + 1} of ${cases.length}${item.placeholder ? ", illustration" : `: ${item.title}`}`}
      className="on-dark fixed inset-0 z-[60] flex flex-col bg-[#141311] text-on-dark"
    >
      {/* Top bar */}
      <header data-studio-chrome {...swipeProps} className="flex items-center justify-between gap-3 border-b border-on-dark/10 px-4 py-3 md:px-8">
        <p className="flex items-baseline gap-3 text-sm">
          <span className="font-display text-xl tabular-nums">
            {String(index + 1).padStart(2, "0")}
            <span className="text-on-dark-muted">/{String(cases.length).padStart(2, "0")}</span>
          </span>
          <span className="hidden text-on-dark-muted sm:inline">Case studio</span>
        </p>
        <div role="tablist" aria-label="View" className="flex rounded-full bg-on-dark/[0.06] p-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              role="tab"
              type="button"
              aria-selected={mode === m.key}
              onClick={() => setMode(m.key)}
              className={`min-h-9 rounded-full px-3 text-[0.78rem] transition-colors md:px-4 ${mode === m.key ? "bg-ivory text-charcoal" : "text-on-dark-muted hover:text-on-dark"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button type="button" data-autofocus onClick={close} aria-label="Close case studio" className="grid size-11 place-items-center rounded-full border border-on-dark/15 text-xl transition hover:bg-on-dark/10">
          <Close />
        </button>
      </header>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-5 p-4 md:p-8 lg:grid-cols-[1fr_20rem] lg:grid-rows-1 lg:gap-10">
        <div ref={stage} className="flex min-h-0 items-center justify-center" role="tabpanel" aria-label={MODES.find((m) => m.key === mode)!.label}>
          {mode === "compare" && (
            <div className="aspect-[4/5] h-full max-h-full max-w-full">
              <CompareSlider key={item.id} item={item} sizes="(min-width: 1024px) 45vw, 100vw" className="size-full rounded-xl" priority />
            </div>
          )}
          {mode === "side" && (
            <div className="size-full max-w-5xl">
              <SyncedLoupe key={item.id} before={item.before} after={item.after} placeholder={item.placeholder} />
            </div>
          )}
          {mode === "timeline" && (
            <div className="size-full max-w-4xl">
              <StageTimeline key={item.id} frames={frames} placeholder={item.placeholder} />
            </div>
          )}
        </div>

        <aside data-studio-chrome {...swipeProps} className="flex flex-col gap-5 lg:py-4">
          <div>
            <p className="eyebrow eyebrow-on-dark">{item.categories.map((c) => (c.length <= 3 ? c.toUpperCase() : c[0].toUpperCase() + c.slice(1))).join(" · ")}</p>
            <h2 className="mt-3 font-display text-[2rem] leading-tight">{item.placeholder ? "Patient result" : item.title}</h2>
            {item.placeholder && <p className="mt-3 rounded-lg border border-dashed border-bronze-soft/50 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-bronze-soft">{PLACEHOLDER_NOTE}</p>}
          </div>
          <dl className="hidden divide-y divide-on-dark/10 border-y border-on-dark/10 text-sm sm:block">
            {meta
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-on-dark-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {item.note && <p className="text-sm leading-relaxed text-on-dark-muted">{item.note}</p>}
          <p className="hidden text-xs leading-relaxed text-on-dark-muted lg:block">
            {item.placeholder
              ? "Diagram of the scalp from above. Bronze strokes show transplanted grafts. Real cases replace these once consented photographs are supplied."
              : "Results vary from person to person. Shown with the patient's written consent, unretouched."}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(-1)} className="flex min-h-11 items-center gap-2 rounded-full border border-on-dark/15 px-4 text-sm transition hover:bg-on-dark/10">
              <ArrowRight className="size-4 rotate-180" /> Previous
            </button>
            <button type="button" onClick={() => go(1)} className="flex min-h-11 items-center gap-2 rounded-full bg-ivory px-4 text-sm text-charcoal transition hover:bg-white">
              Next case <ArrowRight className="size-4" />
            </button>
          </div>
          <p className="hidden text-center text-[0.68rem] text-on-dark-muted lg:block">← → to browse · 1 2 3 to switch view · Esc to close</p>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
