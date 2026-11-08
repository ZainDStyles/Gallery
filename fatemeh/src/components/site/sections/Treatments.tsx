"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TREATMENTS } from "@/content/treatments";
import { ArrowUpRight } from "@/components/ui/icons";

/**
 * Editorial list. On desktop, hovering a row swaps the photograph beside it;
 * on phones each treatment is a simple card.
 */
export function TreatmentList() {
  const [active, setActive] = useState(0);
  const current = TREATMENTS[active];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <ol className="border-t border-line lg:col-span-7">
        {TREATMENTS.map((t, i) => (
          <li key={t.slug} data-reveal className="border-b border-line">
            <Link
              href={`/treatments/${t.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 py-7 md:grid-cols-[4rem_1fr_auto] md:py-9"
            >
              <span className="pt-2 font-display text-lg text-bronze">0{i + 1}</span>
              <span>
                <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">{t.kicker}</span>
                <span className="mt-2 block font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1] transition-[color,transform] duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-2 group-hover:text-bronze">
                  {t.name}
                </span>
                <span className="mt-3 block max-w-xl text-[0.95rem] leading-relaxed text-stone">{t.summary}</span>
              </span>
              <span className="mt-2 grid size-11 place-items-center rounded-full border border-charcoal/15 transition-all duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45 group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-ivory">
                <ArrowUpRight className="size-4" />
                <span className="sr-only">Read about {t.name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-sand">
          {TREATMENTS.map((t, i) => (
            <div
              key={t.slug}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-luxe)] ${i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
            >
              <Image src={t.image} alt={i === active ? t.imageAlt : ""} fill sizes="40vw" className="object-cover object-[50%_25%]" />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-7 pt-24 text-ivory">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-bronze-pale">{current.kicker}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-ivory/85">
              {current.mayHelpWith.slice(0, 3).map((m) => (
                <li key={m}>— {m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
