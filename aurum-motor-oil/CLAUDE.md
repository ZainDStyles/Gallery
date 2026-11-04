# Car oil website (read this first)

Zain's motor oil shop website. Working name **Aurum** (placeholder, not chosen yet).
This is its own project. It is separate from Life HQ, Zain's personal website and TSUGI: never copy code or data between them.

## Where it lives

- Code: this folder in the public ZainDStyles/Gallery repo (GitHub Pages: https://zaindstyles.github.io/Gallery/aurum-motor-oil/).
- Preview: private Claude artifact https://claude.ai/artifact/7pDjuWRpvYwLkbgNEqpiAi. To update it, publish `index.html`
  with the Artifact tool to that URL, with `hd/` and `frames/` as supporting files.
- `index.html` is the whole site. Product data sits between `/*DATA*/` and `/*END*/` (same as `data/oils.json`).

## Decisions so far

- UK market, prices in £. Zain is a reseller of existing brands (Castrol, TotalEnergies, Carlube, Redex, Comma).
- No retailer own-brands (Halfords, DriveTec). No brand logos or Google product photos: use supplier images later.
- Style: near-black, warm ivory, oil gold (#f4aa1f), Archivo (wide, 125%) for display, JetBrains Mono for labels.
- Mostly used on iPhone. The hero frames are 1170px wide; 4K was tried and rejected (too heavy, no visible gain on phones).
- Desktop shows the portrait video full screen, cropped to each shot's subject (FOCUS in index.html).
- Higgsfield credits are low (2.25 on 31 Oct 2026). A 16:9 desktop video would need about 18 credits (10s Kling Pro) or 123 (reframe).

## Rules

- Specs must come from maker or retailer pages (see data/research.md). Mark anything unconfirmed. Prices are examples until Zain sets them.
- Checkout and enquiries must say plainly that nothing is sent until they are connected.
- Zain is learning web development: explain changes simply, be direct about bad ideas, keep replies short.
- Ask Zain before spending Higgsfield credits or adding paid services.

## Next: landscape video for desktop (waiting on Higgsfield credits)

Zain approved this plan: mobile stays as it is; desktop gets its own 16:9 video once there are credits.

- Generate with Kling 3.0, mode `pro`, `sound: off`, 10 s, aspect `16:9` (about 17.5 credits). Use the same four-shot prompt
  as the phone video so the steps line up (saved in `source/hero-prompt.txt`).
- Cut it into frames in a `wide/` folder (1920px wide AVIF), find the shot cuts, and give the desktop its own N and SHOTS.
- In `index.html`, load `wide/` frames when the screen is landscape and `hd/` when portrait. Keep the 4-step copy and timing.
- The artifact allows at most 511 files per version: 241 hd + 241 wide + index fits only if the WebP `frames/` fallback is dropped.
