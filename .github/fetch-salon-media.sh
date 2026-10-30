#!/usr/bin/env bash
# Downloads each file listed in salon/assets/media.txt and saves a web-sized copy next to it.
# Line format: <output-name> <url>. Files that already exist are skipped.
set -euo pipefail
cd salon/assets
tmp=$(mktemp -d)

while read -r name url; do
  [[ -z "${name:-}" || "$name" == \#* ]] && continue
  case "$url" in
    *.mp4)
      [[ -f "$name.mp4" ]] && continue
      echo "== $name"
      curl -fsSL --retry 3 -D - -o "$tmp/$name.mp4" "$url" | grep -iE '^(HTTP|content-type|content-length)' || true
      # 720p H.264 with no audio; faststart lets it begin playing before it has fully downloaded
      ffmpeg -nostdin -loglevel error -y -i "$tmp/$name.mp4" -an \
        -vf "scale='if(gt(iw,ih),1280,720)':-2" \
        -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$name.mp4"
      # First frame doubles as the still shown while the video loads
      ffmpeg -nostdin -loglevel error -y -i "$name.mp4" -frames:v 1 -q:v 3 "$name.jpg"
      ;;
    *)
      [[ -f "$name.jpg" ]] && continue
      echo "== $name"
      curl -fsSL --retry 3 -D - -o "$tmp/$name.src" "$url" | grep -iE '^(HTTP|content-type|content-length)' || true
      ffmpeg -nostdin -loglevel error -y -i "$tmp/$name.src" -vf "scale='min(1000,iw)':-2" -q:v 3 "$name.jpg"
      ;;
  esac
  ls -lh "$name".*
done < media.txt
