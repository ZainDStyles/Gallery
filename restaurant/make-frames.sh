#!/usr/bin/env bash
# Turns the hero clips into numbered WebP frames for the scroll animation.
# Usage: bash restaurant/make-frames.sh clip-1.mp4[:first:last[:fps]] clip-2.mp4[:first:last[:fps]] ...
# Clips play one after another as you scroll. Each clip's last frame should match
# the next clip's first frame (generate them with start/end keyframes).
# Add :first:last (frame numbers, from 0) to keep only part of a clip, e.g. to drop
# a still tail where nothing moves: clip-1.mp4:0:99
# Add :fps to keep more or fewer frames for one clip: fast motion needs more
# (24), slow or fuzzy motion like flames looks fine with fewer (12).
#
# Writes restaurant/assets/frames/lg (desktop, 1080x1440) and sm (phones, 720x960),
# and prints the frame count of each clip for CLIPS in index.html.
set -euo pipefail
# Optional colour grade applied to every frame (ffmpeg filters), e.g. to deepen a
# grey studio backdrop to black so it blends into the page:
#   LOOK="colorlevels=rimin=0.05:gimin=0.05:bimin=0.06" bash restaurant/make-frames.sh ...
LOOK=${LOOK:-null}
FPS=${FPS:-12}   # frames kept per second of clip: more = smoother but heavier (the page blends between frames)
out="$(cd "$(dirname "$0")" && pwd)/assets/frames"
rm -rf "$out" && mkdir -p "$out/lg" "$out/sm"
tmp=$(mktemp -d)
n=0
for arg in "$@"; do
  IFS=: read -r clip first last fps <<< "$arg"
  trim="trim=start_frame=${first:-0}${last:+:end_frame=$((last + 1))},setpts=PTS-STARTPTS"
  # Clips are tagged as standard HD colour so the frames keep the same colours in every browser
  ffmpeg -nostdin -loglevel error -y -i "$clip" -an \
    -vf "$trim,fps=${fps:-$FPS},setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv,$LOOK,format=rgb24" \
    -start_number $((n + 1)) "$tmp/%03d.png"
  count=$(( $(ls "$tmp" | wc -l) - n ))
  echo "$(basename "$clip"): $count frames ($((n + 1))-$((n + count)))"
  n=$((n + count))
done
for f in "$tmp"/*.png; do
  name=$(basename "$f" .png)
  ffmpeg -nostdin -loglevel error -y -i "$f" -vf "scale=1080:1440:flags=lanczos" -c:v libwebp -quality 66 -preset photo "$out/lg/$name.webp"
  ffmpeg -nostdin -loglevel error -y -i "$f" -vf "scale=720:960:flags=lanczos" -c:v libwebp -quality 62 -preset photo "$out/sm/$name.webp"
done
rm -rf "$tmp"
echo "total: $n frames"
du -sh "$out/lg" "$out/sm"
