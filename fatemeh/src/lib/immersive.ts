"use client";

/**
 * Pinned scenes call setImmersive(true) while they fill the screen. The header
 * turns dark and the phone CTA bar steps aside, so the scene is uninterrupted.
 */
const EVENT = "fatemeh:immersive";
let count = 0;

export function setImmersive(on: boolean) {
  count = Math.max(0, count + (on ? 1 : -1));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: count > 0 }));
}

export function onImmersive(cb: (on: boolean) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
