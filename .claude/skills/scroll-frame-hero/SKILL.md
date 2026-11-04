---
name: scroll-frame-hero
description: Make a cinematic hero where a video plays frame by frame as the visitor scrolls (used in Aurum Motor Oil, Lacquer Detail and earlier Reface versions). Use when asked for a scroll video hero, scrubbed video, "scroll to pour/wash/build" effect, or to turn a Higgsfield video into a hero.
---

# Scroll-scrubbed frame hero

Reference build: `Gallery/aurum-motor-oil/index.html` (read its first `<script>`) and `tools/make-frames.sh`.

## Pipeline
1. Video: generate with Zain's approval (Higgsfield credits cost money). Phone first: 9:16, ~10 s, 4 equal shots
   so each quarter of the scroll is one shot. Keep the prompt in `source/hero-prompt.txt`.
2. Frames: `tools/make-frames.sh source/hero.mp4` → `hd/0001.avif…` (1170px wide, AV1 crf 28, ~25 KB each)
   plus `frames/0001.webp` fallback for iOS 15 and older. ~240 frames ≈ 6 MB AVIF.
   4K was tested and rejected: heavier, no visible gain on phones.
3. Find shot cuts: `ffmpeg -i hero.mp4 -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*'`,
   then set `N` and `SHOTS` in the page.

## Page technique (keep these, they fixed real problems)
- A tall track (`height: 600vh`) with a `position: sticky` full-screen stage and a `<canvas>`.
- CSS background = frame 1, so something shows before JS runs.
- Load frames coarse-to-fine (every 16th, 8th, 4th...) with max 6 in flight, so scrubbing works before all frames arrive.
- Probe AVIF support with a tiny data URI; fall back to WebP.
- Draw the nearest loaded frame inside the current shot only (never blend two frames: a paused scroll showed a double image).
- Ease progress toward the scroll position (`p += (target - p) * (1 - exp(-dt*8))`), snap when `prefers-reduced-motion`.
- Canvas at devicePixelRatio (max 3); cover-fit with a per-shot vertical focus so desktop crops to the subject.
- Pause the loop with IntersectionObserver + `visibilitychange` (saves battery).
- Headline copy changes per quarter; text in HTML (not baked into the video) so it's sharp and editable.

## Check
Phone 390x844 and desktop: scroll through all four steps, no blank frames, no console errors, first frame visible instantly.
