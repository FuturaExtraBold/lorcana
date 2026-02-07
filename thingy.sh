#!/bin/bash

BASE_URL="https://www.digitaltq.com/images/collections/lorcana/thefirstchapter"
OUT_DIR="lorcana_images"

mkdir -p "$OUT_DIR"
cd "$OUT_DIR" || exit 1

for i in $(seq 1 230); do
  printf -v NUM "%03d" "$i"
  URL="$BASE_URL/$i.jpg"
  FILE="$NUM.jpg"

  echo "Downloading $URL -> $FILE"
  curl -f -s -o "$FILE" "$URL" || echo "Failed: $URL"
done
