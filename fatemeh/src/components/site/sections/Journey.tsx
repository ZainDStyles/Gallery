"use client";

import { useRef } from "react";
import { LinkButton } from "@/components/ui/Button";
import { gsap, useGSAP } from "@/lib/gsap";

export const STEPS = [
  { title: "Submit your photographs", body: "Four photos taken on your phone (front, top, crown and donor area) and a few questions about your hair. It takes a few minutes." },
  { title: "Receive your assessment", body: "Fatemeh reviews your photographs and history personally and tells you honestly what is, and isn't, achievable." },
  { title: "Receive your personalised quotation", body: "If you're suitable, you'll receive a written quotation: the recommended technique, an estimated graft range and what's included." },
  { title: "Confirm your appointment", body: "Choose a date that suits you. Every appointment is reviewed and approved personally before it is confirmed." },
  { title: "Pay your deposit", body: "A deposit secures your date. You'll receive clear terms in writing first, including what happens if you need to reschedule." },
  { title: "Attend your treatment", body: "On the day, your plan is reviewed with you before anything begins, followed by aftercare guidance and follow-up reviews." },
];

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-journey-line]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-journey-list]", start: "top 70%", end: "bottom 70%", scrub: 0.5 } },
        );
        gsap.utils.toArray<HTMLElement>("[data-journey-dot]").forEach((dot) => {
          gsap.fromTo(
            dot,
            { backgroundColor: "#f6f1e9", borderColor: "#c9bca8", color: "#7c756b" },
            {
              backgroundColor: "#1c1b19",
              borderColor: "#1c1b19",
              color: "#f6f1e9",
              duration: 0.4,
              scrollTrigger: { trigger: dot, start: "top 70%", toggleActions: "play none none reverse" },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="journey" aria-labelledby="journey-title" className="bg-sand/60 py-24 md:py-36">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p data-reveal className="eyebrow">
              How it works
            </p>
            <h2 id="journey-title" data-reveal className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">
              Six considered steps, <em>at your pace.</em>
            </h2>
            <p data-reveal className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-stone">
              Nothing is booked or charged until you&apos;ve seen your assessment and quotation and decided to go ahead.
            </p>
            <div data-reveal className="mt-9">
              <LinkButton href="/assessment" arrow>
                Start with step one
              </LinkButton>
            </div>
          </div>
        </div>

        <ol data-journey-list className="relative lg:col-span-7">
          <span aria-hidden className="absolute bottom-6 left-[1.375rem] top-6 w-px bg-line-strong" />
          <span aria-hidden data-journey-line className="absolute bottom-6 left-[1.375rem] top-6 w-px origin-top bg-charcoal" />
          {STEPS.map((s, i) => (
            <li key={s.title} data-reveal className="relative grid grid-cols-[2.75rem_1fr] gap-6 pb-12 last:pb-0">
              <span
                data-journey-dot
                className="relative z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-ivory font-display text-lg text-muted"
              >
                {i + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="font-display text-[1.75rem] leading-tight md:text-[2rem]">{s.title}</h3>
                <p className="mt-2.5 max-w-lg leading-relaxed text-stone">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
