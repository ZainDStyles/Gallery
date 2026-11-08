"use client";

import { useMemo, useState } from "react";
import { RESULT_FILTERS, type ResultCase, type ResultCategory } from "@/content/results";
import { CompareSlider } from "./CompareSlider";

export function ResultsGallery({ cases, limit, dark = false }: { cases: ResultCase[]; limit?: number; dark?: boolean }) {
  const [filter, setFilter] = useState<"all" | ResultCategory>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: cases.length };
    for (const item of cases) for (const cat of item.categories) c[cat] = (c[cat] ?? 0) + 1;
    return c;
  }, [cases]);

  const visible = cases.filter((c) => filter === "all" || c.categories.includes(filter)).slice(0, limit);

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
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
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
              <CompareSlider item={item} hint={i === 0} />
              <div className={`mt-4 flex items-start justify-between gap-4 ${dark ? "text-on-dark" : ""}`}>
                <div>
                  <p className="font-display text-xl leading-tight">{item.placeholder ? "Patient result" : item.title}</p>
                  <p className={`mt-1 text-sm ${dark ? "text-on-dark-muted" : "text-stone"}`}>
                    {item.technique}
                    {item.grafts ? ` · ${item.grafts}` : ""} · {item.timeAfter}
                  </p>
                  {item.note && <p className={`mt-2 text-sm ${dark ? "text-on-dark-muted" : "text-stone"}`}>{item.note}</p>}
                </div>
                {item.placeholder && (
                  <span className="mt-1 shrink-0 rounded border border-dashed border-bronze-soft/60 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-bronze-soft">
                    Placeholder
                  </span>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
