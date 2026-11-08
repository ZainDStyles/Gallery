"use client";

import { useId, useState } from "react";
import { Plus } from "@/components/ui/icons";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-panel-${i}`;
        const buttonId = `${base}-button-${i}`;
        return (
          <li key={item.q} data-reveal className="border-b border-line">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="font-display text-[1.45rem] leading-snug transition-colors group-hover:text-bronze md:text-[1.75rem]">{item.q}</span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-luxe)] ${
                    isOpen ? "rotate-45 border-charcoal bg-charcoal text-ivory" : "border-charcoal/15"
                  }`}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            {/* Answers stay in the HTML when closed so search engines can read them. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-luxe)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-8 pr-14 leading-relaxed text-stone">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
