#!/usr/bin/env bash
# Rebuild the hero's scroll frames from a video.
# Usage: tools/make-frames.sh source/hero.mp4
# Needs ffmpeg with libaom-av1 and libwebp.
set -euo pipefail
VIDEO="${1:-source/hero.mp4}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1170px wide (iPhone screen width), lightly sharpened
ffmpeg -v error -y -i "$VIDEO" -vf "scale=1170:-2:flags=lanczos,unsharp=5:5:0.5:5:5:0" "$TMP/%04d.png"

# Sharp, light AVIF frames for modern browsers
rm -rf hd && mkdir -p hd
ls "$TMP" | xargs -P 4 -I{} sh -c 'ffmpeg -v error -y -i "'"$TMP"'/{}" -c:v libaom-av1 -still-picture 1 -crf 28 -cpu-used 6 -pix_fmt yuv420p "hd/$(basename {} .png).avif"'

# WebP fallback for older iPhones (iOS 15 and below)
rm -rf frames && mkdir -p frames
ffmpeg -v error -y -i "$VIDEO" -c:v libwebp -quality 72 -compression_level 6 frames/%04d.webp

echo "Frames: $(ls hd | wc -l). Find the shot cuts with:"
echo "  ffmpeg -i $VIDEO -vf \"select='gt(scene,0.25)',showinfo\" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*'"
echo "Then update N and SHOTS in index.html (frame index = seconds x fps)."
