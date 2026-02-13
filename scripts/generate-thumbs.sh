#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="public/lorcana_images"
OUT_DIR="${SRC_DIR}/thumbs"
MAX_SIZE=512
QUALITY=70

mkdir -p "$OUT_DIR"

shopt -s nullglob
for file in "$SRC_DIR"/*.jpg "$SRC_DIR"/*.jpeg "$SRC_DIR"/*.png; do
  base="$(basename "$file")"
  out="${OUT_DIR}/${base}"
  sips -Z "$MAX_SIZE" "$file" \
    --setProperty formatOptions "$QUALITY" \
    --out "$out" >/dev/null
done

echo "Wrote thumbnails to ${OUT_DIR}"
