"use client";

import { useEffect, useState } from "react";

/**
 * True once the element is within `margin` of the viewport. Heavy scroll
 * scenes wait for this, so they cost nothing at page load.
 */
export function useNear(ref: React.RefObject<HTMLElement | null>, margin = "120% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
