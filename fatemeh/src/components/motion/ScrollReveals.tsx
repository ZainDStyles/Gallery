"use client";

import { usePathname } from "next/navigation";
import { gsap, markMotionReady, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * One controller for every scroll animation on the page, driven by data
 * attributes so sections stay simple server components:
 *
 *   data-reveal         fade + rise as it enters the viewport
 *   data-reveal-image   image unmasks and settles from a slight zoom
 *   data-parallax       gentle vertical drift (desktop only)
 *
 * Only transform/opacity/clip-path are animated (GPU-friendly on iPhone),
 * and nothing runs when the visitor prefers reduced motion.
 */
export function ScrollReveals() {
  const pathname = usePathname();

  useGSAP(
    () => {
      markMotionReady();
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "power3.out", overwrite: true }),
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal-image]").forEach((el) => {
          const img = el.querySelector("img");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
          tl.fromTo(el, { clipPath: "inset(10% 6% 10% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power3.inOut" });
          if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.8, ease: "power2.out" }, 0);
        });
      });

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } },
          );
        });
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
