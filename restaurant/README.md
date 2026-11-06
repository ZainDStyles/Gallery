# Brasa — scroll-animated restaurant hero

A one-page restaurant site with a "3D" scroll hero: as you scroll, a burger's floating
layers stack together, then flames rise behind it. Under the hero there's a short menu
and a visit section. Everything lives in `index.html`; the animation frames live in
`assets/frames/`.

Live demo (once merged to `main`): https://zainmhene.github.io/Gallery/restaurant/

## How the animation works

It isn't real 3D. It's two AI video clips cut into still frames (like a flip book).
The page draws the right frame onto a `<canvas>` for how far you've scrolled, so
scrolling "plays" the video forwards and backwards.

1. **Three keyframe images** (Higgsfield, GPT Image 2.6, about 1 credit each): the
   finished burger, the same burger exploded into floating layers, and the same burger
   with flames behind it. The exploded and fire images were made *from* the finished
   one, so the burger stays identical.
2. **Two clips** (Higgsfield, MiniMax H3, 2K, 5 s, 10 credits each). Each clip uses
   two keyframes as its start and end frame:
   - clip 1: exploded → finished (the layers stack)
   - clip 2: finished → on fire

   Clip 1 ends on the same image clip 2 starts on, so together they play as one shot.
3. **`make-frames.sh`** turns the clips into WebP frames in two sizes: `lg` for
   desktop (1080×1440) and `sm` for phones (720×960).

Total cost for this one: about 23 credits.

## Re-branding it for a new restaurant

Work through this list in `index.html` (use Find to jump to each one).

1. **Name.** Replace every `Brasa`, including the `<title>`, the `og:` tags at the
   top, the loader and the footer.
2. **Headlines and labels.** The three acts ("Seven layers", "Stacked by hand",
   "Cooked over live fire") and the seven ingredient labels are plain HTML in the hero.
3. **Signature dish and price.** The "The signature" card in the hero.
4. **Menu.** The `<ul class="menu">` list.
5. **Address, phone and hours.** The Visit section, plus `HOURS` in the script (it
   powers the "Open today" line). `020 7946 0123` is a fake number reserved for TV
   and films, and `48 Hearth Lane` is made up.
6. **Food claims.** "Forty days dry-aged", "eighteen-month cheddar" and so on are
   placeholder copy. Only publish claims the restaurant can back up.
7. **Link preview.** Update `og:url` and `og:image` to the new web address and replace
   `assets/og.jpg` (1200 × 630).
8. **Footer credit.** `Website by TSUGI`, so leave it in.

## Shooting a new animation (different dish)

1. Generate the **finished dish** on a plain, near-black background, centred, with
   empty space above and below. Portrait 3:4.
2. Generate the **other states** using the finished image as a reference: "the exact
   same dish, same camera, same lighting, but …" (exploded, on fire, sliced, steaming…).
3. Generate a clip for each pair with **start and end frames** (MiniMax H3 works
   well). Say "static locked-off camera, no camera movement" in the prompt so the
   text on the page stays lined up.
4. Download the clips and run:

   ```bash
   bash restaurant/make-frames.sh clip-1.mp4:0:99:24 clip-2.mp4
   ```

   `:0:99` keeps frames 0–99 (drop any still tail where nothing moves). `:24` keeps 24
   frames per second for fast motion; the default is 12, which is fine for flames.
5. In `index.html`, set `CLIPS` to the frame counts the script prints, adjust
   `TIMELINE` if you want the holds longer or shorter, and update `LAYERS` (where each
   ingredient sits in the first frame, as fractions of the frame) so the labels point
   at the right things.

## Weight

The frames are about 14 MB on desktop and 7 MB on phones. The page shows a rough
pass first (about 1 MB), so it's usable in a second or two while the rest streams in.

## Source media

Keyframes and clips generated on Higgsfield, 6 Nov 2026:

- finished burger: `hf_20261106_210442_e4801c08-8765-4ea8-abb4-df978eafb510.png`
- exploded burger: `hf_20261106_210537_45aa8e4a-0102-4f85-857a-acb465f9c629.png`
- burger on fire: `hf_20261106_210537_b43739af-4183-470e-9088-806af9ff2ea2.png`
- clip 1 (stack): `hf_20261106_210656_94fb5481-4a58-4088-a5d1-069df5a5daec.mp4`
- clip 2 (fire): `hf_20261106_210658_5bee334b-83f5-4e0d-86b3-6b17547baff7.mp4`
