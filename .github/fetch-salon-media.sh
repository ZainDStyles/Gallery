#!/usr/bin/env bash
# Downloads each file listed in salon/assets/media.txt and saves web-sized copies next to it.
# Line format: <output-name> <url>. Outputs that already exist are skipped.
set -euo pipefail
cd salon/assets
tmp=$(mktemp -d)

fetch() {
  curl -fsSL --retry 3 --connect-timeout 20 --max-time 180 -D - -o "$2" "$1" | grep -iE '^(HTTP|content-type|content-length)' || true
}

encode() {
  ffmpeg -nostdin -loglevel error -y -i "$1" -an -pix_fmt yuv420p -movflags +faststart "${@:2}"
}

while read -r name url; do
  [[ -z "${name:-}" || "$name" == \#* ]] && continue
  case "$url" in
    *.mp4)
      # Each clip gets full-HD AV1 (Chrome, Firefox, Android) and HEVC (Safari, iPhone),
      # a 720p H.264 fallback for older browsers, and a still of the first frame
      [[ -f "$name.av1.mp4" && -f "$name.hevc.mp4" && -f "$name.mp4" && -f "$name.webp" ]] && continue
      echo "== $name"
      src="$tmp/$name.mp4"
      fetch "$url" "$src"
      [[ -f "$name.av1.mp4" ]] || encode "$src" -c:v libsvtav1 -crf 38 -preset 4 -g 120 "$name.av1.mp4"
      [[ -f "$name.hevc.mp4" ]] || encode "$src" -c:v libx265 -crf 28 -preset slow -tag:v hvc1 \
        -x265-params log-level=error "$name.hevc.mp4"
      [[ -f "$name.mp4" ]] || encode "$src" -vf "scale='if(gt(iw,ih),1280,720)':-2" \
        -c:v libx264 -preset slow -crf 26 "$name.mp4"
      [[ -f "$name.webp" ]] || ffmpeg -nostdin -loglevel error -y -i "$src" -frames:v 1 \
        -c:v libwebp -quality 72 "$name.webp"
      ;;
    *)
      [[ -f "$name.jpg" ]] && continue
      echo "== $name"
      fetch "$url" "$tmp/$name.src"
      ffmpeg -nostdin -loglevel error -y -i "$tmp/$name.src" -vf "scale='min(1000,iw)':-2" -q:v 3 "$name.jpg"
      ;;
  esac
  ls -lh "$name".*
done < media.txt
