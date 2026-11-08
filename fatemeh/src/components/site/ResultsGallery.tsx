"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RESULT_FILTERS, type ResultCase, type ResultCategory } from "@/content/results";
import { CompareSlider } from "./CompareSlider";

// Loaded only when someone opens a case.
const CaseStudio = dynamic(() => import("./studio/CaseStudio").then((m) => m.CaseStudio), { ssr: false });

function Expand(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden {...props}>
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </svg>
  );
}

export function ResultsGallery({ cases, limit, dark = false }: { cases: ResultCase[]; limit?: number; dark?: boolean }) {
  const [filter, setFilter] = useState<"all" | ResultCategory>("all");
  const [open, setOpen] = useState<number | null>(null);
  const origin = useRef<DOMRect | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: cases.length };
    for (const item of cases) for (const cat of item.categories) c[cat] = (c[cat] ?? 0) + 1;
    return c;
  }, [cases]);

  const filtered = cases.filter((c) => filter === "all" || c.categories.includes(filter));
  const visible = filtered.slice(0, limit);

  const openCase = (i: number, el: HTMLElement | null) => {
    origin.current = el?.getBoundingClientRect() ?? null;
    setOpen(i);
  };

  // Deep links: /results#case=<id> opens that case directly.
  useEffect(() => {
    const fromHash = () => {
      const id = new URLSearchParams(window.location.hash.slice(1)).get("case");
      const i = id ? filtered.findIndex((c) => c.id === id) : -1;
      if (i >= 0) {
        origin.current = null;
        setOpen(i);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open === null) return;
    history.replaceState(null, "", `#case=${filtered[open]?.id}`);
  }, [open, filtered]);

  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return (
    <div>
      <div role="group" aria-label="Filter results by treatment" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {RESULT_FILTERS.filter((f) => f.value === "all" || counts[f.value]).map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors duration-300 ${
                dark
                  ? active
                    ? "border-on-dark bg-on-dark text-charcoal"
                    : "border-on-dark/20 text-on-dark-muted hover:border-on-dark/50 hover:text-on-dark"
                  : active
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/15 text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[f.value] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <ul key={filter} className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <li key={item.id} className="motion-safe:animate-[rise_0.7s_var(--ease-luxe)_both]" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="relative" data-case-frame>
              <CompareSlider item={item} hint={i === 0} />
              <button
                type="button"
                onClick={(e) => openCase(i, e.currentTarget.closest("[data-case-frame]"))}
                aria-label={`Open case ${i + 1} in the case studio`}
                className={`absolute right-3 grid size-11 ${item.placeholder ? "bottom-14" : "bottom-3"} place-items-center rounded-full bg-ivory/90 text-charcoal shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white`}
              >
                <Expand className="size-4" />
              </button>
            </div>
            <div className={`mt-4 flex items-start justify-between gap-4 ${dark ? "text-on-dark" : ""}`}>
              <div>
                <p className="font-display text-xl leading-tight">{item.placeholder ? "Patient result" : item.title}</p>
                <p className={`mt-1 text-sm ${dark ? "text-on-dark-muted" : "text-stone"}`}>
                  {item.technique}
                  {item.grafts ? ` · ${item.grafts}` : ""} · {item.timeAfter}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => openCase(i, (e.currentTarget.closest("li") as HTMLElement)?.querySelector("[data-case-frame]") as HTMLElement)}
                className={`mt-0.5 shrink-0 border-b pb-0.5 text-sm transition-colors ${dark ? "border-on-dark/30 hover:border-bronze-soft hover:text-bronze-soft" : "border-charcoal/30 hover:border-bronze hover:text-bronze"}`}
              >
                View case
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open !== null && filtered[open] && <CaseStudio cases={filtered} index={open} origin={origin.current} onIndex={setOpen} onClose={close} />}
    </div>
  );
}
