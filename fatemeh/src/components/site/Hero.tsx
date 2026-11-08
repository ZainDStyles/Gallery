"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { site } from "@/content/site";
import { LinkButton } from "@/components/ui/Button";
import { Lock, Person, Spark } from "@/components/ui/icons";
import { gsap, markMotionReady, SplitText, useGSAP } from "@/lib/gsap";

const PROMISES = [
  { icon: Spark, text: "Free, no-obligation assessment" },
  { icon: Person, text: "Reviewed personally by Fatemeh" },
  { icon: Lock, text: "Encrypted, private photo handling" },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      markMotionReady();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const split = SplitText.create(q("h1")[0], { type: "lines", mask: "lines", linesClass: "hero-line" });
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.set(q("[data-hero-item]"), { opacity: 1 })
          .to(q("[data-hero-curtain]"), { scaleY: 0, duration: 1.5, ease: "power4.inOut" }, 0)
          .fromTo(q("[data-hero-image]"), { scale: 1.16 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0)
          .fromTo(q("[data-hero-eyebrow]"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.35)
          .fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.45)
          .fromTo(q("[data-hero-fade]"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 0.95)
          .fromTo(q("[data-hero-caption]"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 1 }, 1.2);
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative overflow-hidden bg-ivory lg:grid lg:min-h-[100svh] lg:grid-cols-12">
      {/* Photograph */}
      <div className="relative h-[56svh] min-h-[22rem] overflow-hidden lg:order-2 lg:col-span-6 lg:col-start-7 lg:h-auto">
        <div data-hero-image className="absolute inset-0 will-change-transform">
          <Image
            src="/images/fatemeh/fatemeh-clinic.jpg"
            alt="Fatemeh in the treatment room, preparing sterile instruments"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[50%_22%]"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ivory/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ivory via-ivory/80 to-transparent lg:hidden" />
        <div data-hero-curtain className="absolute inset-0 origin-top bg-ivory" />
        <div data-hero-item data-hero-caption className="absolute bottom-8 left-8 hidden items-center gap-3 rounded-full bg-ivory/85 py-2 pl-2 pr-4 text-xs backdrop-blur lg:flex">
          <span className="relative size-8 overflow-hidden rounded-full">
            <Image src="/images/fatemeh/fatemeh-portrait.jpg" alt="" fill sizes="32px" className="object-cover object-[50%_20%]" />
          </span>
          <span>
            <span className="block font-medium">{site.clinician.fullName ?? site.clinician.name}</span>
            <span className="text-muted">{site.clinician.role ?? "Professional title to be supplied"}</span>
          </span>
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 -mt-32 lg:order-1 lg:col-span-6 lg:mt-0 lg:flex lg:items-center">
        <div className="container-site lg:max-w-none lg:pl-[max(2.5rem,calc((100vw-var(--container-site))/2+2.5rem))] lg:pr-16 lg:pt-20">
          <p data-hero-item data-hero-eyebrow className="eyebrow">
            FUE · DHI · Hairline · Crown
          </p>
          <h1 id="hero-title" data-hero-item className="display mt-4 text-[clamp(2.75rem,7.4vw,6.4rem)] lg:mt-5 text-balance">
            Hair restoration, considered to the <em>last&nbsp;follicle.</em>
          </h1>
          <p data-hero-item data-hero-fade className="mt-5 max-w-[34rem] text-base leading-relaxed text-stone md:mt-6 md:text-lg">
            Personal assessments, honest advice and meticulous planning — from your first photographs to your final review.
          </p>
          <div data-hero-item data-hero-fade className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center md:mt-9 md:gap-3">
            <LinkButton href="/assessment" arrow className="py-4 pl-7 text-[0.95rem]">
              Get Your Free Hair Assessment
            </LinkButton>
            <Link href="/results" className="group inline-flex items-center justify-center gap-2 px-4 py-3 text-[0.9rem] text-charcoal">
              <span className="border-b border-charcoal/30 pb-0.5 transition-colors group-hover:border-bronze group-hover:text-bronze">View results</span>
            </Link>
          </div>
          <ul data-hero-item data-hero-fade className="mb-14 mt-12 grid gap-3 border-t border-line pt-6 text-[0.82rem] text-stone sm:grid-cols-3 lg:mb-10">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-bronze" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
