#!/usr/bin/env bash
# Upload cover images to Cloudinary via POST /media, create published articles.
# Usage: from repo root → bash tools/scripts/seed-public-articles.sh
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
GATEWAY="${GATEWAY_URL:-http://localhost:3001}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "==> Login as staff@demo.local"
curl -sS -c "$COOKIE_JAR" -X POST "$GATEWAY/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"staff@demo.local","password":"password123"}' >/dev/null

upload_media() {
  local file="$1"
  local alt="$2"
  local mime="$3"
  curl -sS -b "$COOKIE_JAR" -X POST "$GATEWAY/media" \
    -F "file=@${file};type=${mime}" \
    -F "altText=${alt}"
}

create_and_publish() {
  local title="$1"
  local slug="$2"
  local body="$3"
  local cover_id="$4"

  local created
  created="$(curl -sS -b "$COOKIE_JAR" -X POST "$GATEWAY/articles" \
    -H 'Content-Type: application/json' \
    -d "$(jq -n \
      --arg title "$title" \
      --arg slug "$slug" \
      --arg body "$body" \
      --arg coverMediaId "$cover_id" \
      '{title:$title, slug:$slug, body:$body, coverMediaId:$coverMediaId}')")"

  local article_id revision_id
  article_id="$(echo "$created" | jq -r '.data.id // .id')"
  revision_id="$(echo "$created" | jq -r '.data.revision.id // .revision.id')"

  if [[ -z "$article_id" || "$article_id" == "null" ]]; then
    echo "Failed to create article for slug=$slug"
    echo "$created"
    return 1
  fi

  curl -sS -b "$COOKIE_JAR" -X POST "$GATEWAY/articles/${article_id}/publish" \
    -H 'Content-Type: application/json' \
    -d "$(jq -n --arg revisionId "$revision_id" '{revisionId:$revisionId}')" >/dev/null

  echo "Published: $slug ($article_id)"
}

HERO="$ROOT/apps/web/public/images/hero-art.webp"
IMG2="/home/ubox163/Downloads/events_cover_01KWC34671F65Z7SQZQA2V9J9X.jpg"
IMG3="/home/ubox163/Downloads/3be94573-38fb-48ed-90bc-b69a03eb74fa.png"

echo "==> Upload covers to Cloudinary"
MEDIA1="$(upload_media "$HERO" "Writing and ideas illustration" "image/webp")"
MEDIA2="$(upload_media "${IMG2:-$HERO}" "Event cover" "image/jpeg")"
MEDIA3="$(upload_media "${IMG3:-$HERO}" "Abstract cover" "image/png")"

ID1="$(echo "$MEDIA1" | jq -r '.data.id // .id')"
URL1="$(echo "$MEDIA1" | jq -r '.data.url // .url')"
ID2="$(echo "$MEDIA2" | jq -r '.data.id // .id')"
URL2="$(echo "$MEDIA2" | jq -r '.data.url // .url')"
ID3="$(echo "$MEDIA3" | jq -r '.data.id // .id')"
URL3="$(echo "$MEDIA3" | jq -r '.data.url // .url')"

echo "Cover 1: $ID1 → $URL1"
echo "Cover 2: $ID2 → $URL2"
echo "Cover 3: $ID3 → $URL3"

if [[ -z "$ID1" || "$ID1" == "null" ]]; then
  echo "Media upload failed:"
  echo "$MEDIA1"
  exit 1
fi

echo "==> Create + publish articles"
SUFFIX="$(date +%s)"

create_and_publish \
  "Human stories that stay with you" \
  "human-stories-that-stay-with-you-${SUFFIX}" \
  "A place to read, write, and deepen your understanding — starting with the stories that refuse to leave you alone." \
  "$ID1"

create_and_publish \
  "Why clarity beats cleverness in writing" \
  "why-clarity-beats-cleverness-${SUFFIX}" \
  "Readers do not owe you their attention. Clear structure, honest voice, and one sharp idea per piece will outlast any flourish." \
  "${ID2:-$ID1}"

create_and_publish \
  "Building a reading habit that actually sticks" \
  "building-a-reading-habit-${SUFFIX}" \
  "Small daily pages beat weekend binges. Here is a practical routine for busy people who still want to stay curious." \
  "${ID3:-$ID1}"

create_and_publish \
  "Notes from the editor's desk" \
  "notes-from-the-editors-desk-${SUFFIX}" \
  "What we look for before we hit publish: truth, voice, and a reason the reader should care by the second paragraph." \
  "$ID1"

create_and_publish \
  "The quiet power of short essays" \
  "the-quiet-power-of-short-essays-${SUFFIX}" \
  "You do not need ten thousand words. Sometimes eight hundred, carefully cut, say more than a sprawling draft ever could." \
  "${ID2:-$ID1}"

echo "==> Public feed check"
curl -sS "$GATEWAY/articles/public?limit=10" | jq '{total, count: (.data | length), sample: .data[0] | {title, cover: .coverMedia.secureUrl}}'
echo "Done."
