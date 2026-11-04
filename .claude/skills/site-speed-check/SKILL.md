---
name: site-speed-check
description: Measure and improve how fast a website loads, especially on phones. Use when asked about performance, speed, lag, page weight, Lighthouse, Core Web Vitals, or before showing a site to a client.
---

# Site speed check

## Measure (Playwright is pre-installed in Claude cloud sessions; don't reinstall it)
Serve the site (`python3 -m http.server 8080` for static, `npm run build && npm start` for Next.js), then load it at
390x844 and 1440x900 and record: total bytes, request count, the 10 largest files, time to load, console errors.
Take before/after screenshots for any change.

## Targets for a demo site on 4G
- First screen under ~1.5 MB; total page under ~5 MB before scrolling (frame heroes load the rest progressively).
- No console errors. No layout jumps (images have width/height or aspect-ratio).

## Usual fixes (safe, don't change the look)
- Images: WebP/AVIF, sized to how they're shown (srcset), `loading="lazy"` + `decoding="async"` below the fold, never on the hero.
- Hero image: `fetchpriority="high"`, preload it.
- Video: compressed (AV1/HEVC + H.264 fallback), `preload="metadata"`, poster image, muted + playsinline.
- Fonts: 1-2 families, `display=swap`, preconnect to fonts.gstatic.com.
- Scripts: `defer`; load heavy libraries (Three.js, GSAP plugins) only where used.
- Animations: transform/opacity only; pause canvas loops when off-screen or the tab is hidden; respect `prefers-reduced-motion`.
- Cache busting: version CSS/JS URLs from file contents so phones get updates (see reface `build.py`).
- Next.js: `next/image` with `sizes`, check First Load JS per route in the build output.

## Report
A short table: page | phone MB | requests | load time | main issues | fixed? Plain words for Zain.
