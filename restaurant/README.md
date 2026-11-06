# Press — scroll-animated smash burger hero

A one-page site for a smash burger joint with a "3D" scroll hero. As you scroll, the
burger's parts float apart with labels, drop and stack together, then steam rises and
the cheese melts. Under the hero there's a short menu and a visit section. Everything
lives in `index.html`; the animation frames live in `assets/frames/`.

Live demo (once merged to `main`): https://zainmhene.github.io/Gallery/restaurant/

## How the animation works

It isn't real 3D. It's two AI video clips cut into still frames (like a flip book).
The page draws the right frame onto a `<canvas>` for how far you've scrolled, so
scrolling "plays" the video forwards and backwards.

1. **Three keyframe photos** (Higgsfield, Nano Banana 2.1, 2 credits each): the
   finished burger, the same burger pulled apart into floating layers, and the same
   burger steaming with the cheese dripping. The other two were made *from* the finished
   one, so the burger stays identical.
2. **Two clips** (Higgsfield, MiniMax H3, 2K, 5 s, 10 credits each). Each clip uses
   two keyframes as its start and end frame:
   - clip 1: pulled apart → finished (the layers stack)
   - clip 2: finished → steaming

   Clip 1 ends on the same image clip 2 starts on, so together they play as one shot.
3. **`make-frames.sh`** turns the clips into WebP frames in two sizes: `lg` for
   desktop (1080×1440) and `sm` for phones (720×960). It also crops in a little and
   deepens the studio backdrop to pure black so the clip melts into the page.

Total cost: 26 credits.

### Keeping it from looking "AI"

What made the first version look fake, and what fixed it:

- **Too perfect.** Ask for real imperfections: lopsided, a little messy, crumbs,
  grease, uneven cheese. Name the real thing: "smash burger, potato bun, lacy crispy
  edges, American cheese".
- **Glowing orange halo in a black void.** Ask for plain studio lighting: "one
  softbox from the upper left, white bounce card, neutral white balance, no glow, no
  rim light".
- **CGI effects** like fire and floating embers. Use real, subtle things instead
  (steam, a cheese drip, falling crumbs).
- **Model choice.** Nano Banana 2.1 looked far more like a real photo than GPT Image
  for food.

## Re-branding it for a new restaurant

Work through this list in `index.html` (use Find to jump to each one).

1. **Name.** Replace every `Press`, including the `<title>`, the `og:` tags at the
   top, the loader and the footer.
2. **Headlines and labels.** The three acts ("Nothing to hide", "Smashed thin",
   "Hot off the griddle") and the five ingredient labels are plain HTML in the hero.
3. **Signature dish and price.** The "The signature" card in the hero.
4. **Menu.** The `<ul class="menu">` list.
5. **Address, phone and hours.** The Visit section, plus `HOURS` in the script (it
   powers the "Open today" line). `020 7946 0123` is a fake number reserved for TV
   and films, and `22 Copper Lane` is made up.
6. **Link preview.** Update `og:url` and `og:image` to the new web address and replace
   `assets/og.jpg` (1200 × 630).
7. **Footer credit.** `Website by TSUGI`, so leave it in.

## Shooting a new animation (different dish)

1. Generate the **finished dish** on a plain black studio backdrop, centred, with
   empty space above and below. Portrait 3:4.
2. Generate the **other states** using the finished photo as a reference: "edit this
   exact photograph, same camera, same lighting, but …" (pulled apart, steaming,
   sliced…).
3. Generate a clip for each pair with **start and end frames** (MiniMax H3 works
   well). Say "static locked-off camera, no camera movement" in the prompt so the
   text on the page stays lined up.
4. Download the clips and run (this is the exact command used for Press):

   ```bash
   LOOK="crop=1260:1680:97:128,colorlevels=rimin=0.045:gimin=0.05:bimin=0.065,vignette=angle=PI/5" \
     bash restaurant/make-frames.sh clip-1.mp4:0:99:24 clip-2.mp4
   ```

   `:0:99` keeps frames 0–99 (drops the still tail where nothing moves). `:24` keeps 24
   frames per second for fast motion; the default is 12, which is fine for slow things
   like steam. `LOOK` crops in and turns the grey backdrop black; adjust or drop it
   for new clips.
5. In `index.html`, set `CLIPS` to the frame counts the script prints, adjust
   `TIMELINE` if you want the holds longer or shorter, and update `LAYERS` (where each
   ingredient sits in the first frame, as fractions of the frame) so the labels point
   at the right things. If the dish sits higher or lower in the frame, also update the
   percentages in the phone part of `layout()`.

## Weight

The frames are about 8 MB on desktop and 4.5 MB on phones. The page shows a rough
pass first (under 1 MB), so it's usable in a second or two while the rest streams in.

## Source media

Keyframes and clips generated on Higgsfield, 6 Nov 2026:

- finished burger: `hf_20261106_214111_028a506e-2c4d-4424-a5cd-46173d0841c5.png`
- pulled apart: `hf_20261106_214217_5765f966-35b6-41a4-bd9e-ba015549ca5e.png`
- steaming: `hf_20261106_214217_e35c907e-f7ea-4c48-9683-2de17419b3ca.png`
- clip 1 (stack): `hf_20261106_214339_45dd9a24-d375-4d9d-870c-dd11606c6d15.mp4`
- clip 2 (steam): `hf_20261106_214344_5b1dfef2-2897-4eb2-9ed1-6e5f48bd1ac7.mp4`
