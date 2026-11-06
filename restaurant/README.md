# Press — scroll-animated smash burger hero

A one-page site for a smash burger joint with a "3D" scroll hero. A wide smash burger
sits on a plate on a table in a dim restaurant. As you scroll, its parts float above
the plate with labels, drop and stack together, then steam rises and the cheese melts. Under the hero there's a short menu and a visit section. Everything
lives in `index.html`; the animation frames live in `assets/frames/`.

Live demo (once merged to `main`): https://zainmhene.github.io/Gallery/restaurant/

## How the animation works

It isn't real 3D. It's two AI video clips cut into still frames (like a flip book).
The page draws the right frame onto a `<canvas>` for how far you've scrolled, so
scrolling "plays" the video forwards and backwards.

1. **Two keyframe photos**:
   - the finished burger on its plate, steaming (Higgsfield, Nano Banana 2.1, 2K,
     2 credits)
   - the same photo edited so the parts float above the plate (Seedream 5.0 Flash,
     2K, 0.5 credits)
2. **One clip** (Seedance 2.0 Mini, 720p, 4 s, 4 credits) with the floating photo as
   its start frame and the finished one as its end frame. The parts drop and stack,
   then steam rises.
3. **`make-frames.sh`** cuts the clip into WebP frames in two sizes: `lg` for desktop
   (1080×1440) and `sm` for phones (720×960). The clip is split in two at the moment
   the burger finishes stacking, so the page can pause there for the middle act.

Total cost: 6.5 credits. (Earlier versions used MiniMax H3 at 2K for sharper clips at
10 credits each.)

**The background isn't flat colour.** Behind the clip, a tiny copy of the current
frame is stretched over the whole screen, blurred and dimmed (`#ambient` in the page).
The warm wall and table light carry on past the edges of the clip, so the whole page
feels like the restaurant.

### Keeping it from looking "AI"

What made the first version look fake, and what fixed it:

- **Too perfect.** Ask for real imperfections: lopsided, a little messy, crumbs,
  grease, uneven cheese. Name the real thing: "smash burger, potato bun, lacy crispy
  edges, American cheese".
- **Glowing orange halo in a black void.** Put the food somewhere real: a plate on a
  table, a dim restaurant wall, a pendant lamp, candles in the background. Ask for
  "rich dark warm tones, not pure black" and "no glow, no rim light".
- **Tall, stacked "American" look.** Ask for "wide and low, about twice as wide as it
  is tall, patties wider than the bun, lacy edges spilling out".
- **CGI effects** like fire and floating embers. Use real, subtle things instead
  (steam, a cheese drip, falling crumbs).
- **Model choice.** Nano Banana 2.1 looked far more like a real photo than GPT Image
  for food.

## Re-branding it for a new restaurant

Work through this list in `index.html` (use Find to jump to each one).

1. **Name.** Replace every `Press`, including the `<title>`, the `og:` tags at the
   top, the loader and the footer.
2. **Headlines and labels.** The three acts ("Nothing to hide", "Smashed thin",
   "Hot off the griddle") and the four ingredient labels are plain HTML in the hero.
3. **Signature dish and price.** The "The signature" card in the hero.
4. **Menu.** The `<ul class="menu">` list.
5. **Address, phone and hours.** The Visit section, plus `HOURS` in the script (it
   powers the "Open today" line). `020 7946 0123` is a fake number reserved for TV
   and films, and `22 Copper Lane` is made up.
6. **Link preview.** Update `og:url` and `og:image` to the new web address and replace
   `assets/og.jpg` (1200 × 630).
7. **Footer credit.** `Website by TSUGI`, so leave it in.

## Shooting a new animation (different dish)

1. Generate the **finished dish** on its plate, in a dim, warm setting, centred in the
   lower half of the frame with empty space above it. Portrait 3:4.
2. Generate the **other states** using the finished photo as a reference: "edit this
   exact photograph, same camera, same lighting, but …" (pulled apart, steaming,
   sliced…).
3. Generate a clip for each pair with **start and end frames** (MiniMax H3 works
   well). Say "static locked-off camera, no camera movement" in the prompt so the
   text on the page stays lined up.
4. Download the clips and run (this is the exact command used for Press):

   ```bash
   LOOK="eq=contrast=1.05:saturation=1.04,vignette=angle=PI/4.5,unsharp=5:5:0.4:5:5:0" \
     bash restaurant/make-frames.sh clip.mp4:0:42:24 clip.mp4:43:96:12
   ```

   The same clip is listed twice to split it: frames 0–42 (the stacking, kept at 24
   frames per second because it moves fast) and 43–96 (the steam, 12 per second is
   plenty). `LOOK` adds a gentle vignette and a touch of sharpening; adjust or drop it
   for new clips.
5. In `index.html`, set `CLIPS` to the frame counts the script prints, adjust
   `TIMELINE` if you want the holds longer or shorter, and update `LAYERS` (where each
   ingredient sits in the first frame, as fractions of the frame) so the labels point
   at the right things. If the dish sits higher or lower in the frame, also update the
   percentages in the phone part of `layout()`.

## Weight

The frames are about 3 MB on desktop and under 2 MB on phones. The page shows a rough
pass first, so it's usable almost straight away while the rest streams in.

## Source media

Generated on Higgsfield, 6 Nov 2026:

- finished burger on the plate: `hf_20261106_220550_9fece86b-4557-4b30-8fc0-445b0921fccb.png`
- parts floating above the plate: `hf_20261106_220644_96924ad3-d07d-47f3-9343-35266e4b0ea5.png`
- clip: `hf_20261106_220741_ea4aae1f-086d-4f4c-9821-6933a5e41002.mp4`
