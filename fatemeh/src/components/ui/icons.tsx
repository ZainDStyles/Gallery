import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ArrowRight = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRight = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
export const Plus = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Check = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const Lock = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);
export const Camera = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
export const Person = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);
export const Close = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const Menu = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const Shield = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const Spark = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
);
export const Upload = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
  </svg>
);
export const Trash = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...base} {...p}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
  </svg>
);
export const WhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden fill="currentColor" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
);
