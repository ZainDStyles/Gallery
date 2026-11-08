"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "power3.out" });

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Signals the safety-net script in <head> that animations are running. */
export function markMotionReady() {
  if (typeof window !== "undefined") (window as unknown as { __motionReady?: boolean }).__motionReady = true;
}
