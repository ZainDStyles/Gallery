"use client";

import { useRef } from "react";
import { TESTIMONIALS } from "@/content/testimonials";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";

export function Testimonials() {
  const track = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 400) + 24), behavior: "smooth" });
  };

  return (
    <section id="stories" aria-labelledby="stories-title" className="overflow-hidden py-24 md:py-36">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p data-reveal className="eyebrow">
              Patient stories
            </p>
            <h2 id="stories-title" data-reveal className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">
              In their <em>own words.</em>
            </h2>
          </div>
          <div data-reveal className="flex gap-2">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous story" className="grid size-12 place-items-center rounded-full border border-charcoal/15 transition hover:bg-charcoal hover:text-ivory">
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Next story" className="grid size-12 place-items-center rounded-full border border-charcoal/15 transition hover:bg-charcoal hover:text-ivory">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <ul
          ref={track}
          className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-2 md:-mx-10 md:scroll-px-10 md:px-10"
        >
          {TESTIMONIALS.map((t, i) => (
            <li key={i} data-reveal className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[42%]">
              <figure
                className={`flex h-full flex-col rounded-[1.5rem] p-8 md:p-10 ${
                  t.placeholder ? "border border-dashed border-line-strong bg-ivory-raised/60" : "bg-ivory-raised"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span aria-hidden className="font-display text-7xl leading-[0.6] text-bronze/70">
                    &ldquo;
                  </span>
                  {t.placeholder && (
                    <span className="rounded border border-dashed border-bronze/50 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-bronze">
                      Placeholder review
                    </span>
                  )}
                </div>
                <blockquote className={`mt-6 font-display text-[1.6rem] leading-[1.25] md:text-[1.9rem] ${t.placeholder ? "text-stone" : ""}`}>
                  {t.quote}
                </blockquote>
                <figcaption className="mt-auto border-t border-line pt-6 text-sm">
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-muted">{t.detail}</span>
                  {t.sourceUrl && (
                    <a href={t.sourceUrl} target="_blank" rel="noopener" className="mt-2 flex items-center gap-1 text-bronze">
                      {t.source ?? "Source"} <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
