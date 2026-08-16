#!/usr/bin/env bash
# Replace public feed covers with the latest asset images.
set -euo pipefail

GATEWAY="${GATEWAY_URL:-http://localhost:3001}"
ASSETS="/home/ubox163/.cursor/projects/home-ubox163-Documents-fullstack-monorepo/assets"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "==> Login"
curl -sS -c "$COOKIE_JAR" -X POST "$GATEWAY/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"staff@demo.local","password":"password123"}' >/dev/null

upload() {
  local file="$1"
  local alt="$2"
  curl -sS -b "$COOKIE_JAR" -X POST "$GATEWAY/media" \
    -F "file=@${file};filename=$(basename "$file" .png).webp;type=image/webp" \
    -F "altText=${alt}"
}

create_publish() {
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
    echo "Create failed for $slug"
    echo "$created"
    exit 1
  fi

  curl -sS -b "$COOKIE_JAR" -X POST "$GATEWAY/articles/${article_id}/publish" \
    -H 'Content-Type: application/json' \
    -d "$(jq -n --arg revisionId "$revision_id" '{revisionId:$revisionId}')" >/dev/null

  echo "Published: $title"
}

echo "==> Soft-delete existing published articles"
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d app -v ON_ERROR_STOP=1 <<'SQL'
UPDATE articles
SET deleted_at = NOW()
WHERE published_revision_id IS NOT NULL
  AND deleted_at IS NULL;
SQL

SUFFIX="$(date +%s)"

echo "==> Upload new covers"
M1="$(upload "$ASSETS/270c15d0-a370-4351-bdaf-48e81e2f92b6-a59b6df7-8466-40f6-8a66-6e02fbe5ec15.png" "Cloud computing neon portrait")"
M2="$(upload "$ASSETS/top-view-laptop-text-nodejs-260nw-2114918222-0959b6f2-c582-42a3-a2c1-407563cb803b.png" "Node.js laptop workspace")"
M3="$(upload "$ASSETS/GenAI_Logo-Image-2_1200x1200pxl-copy-eceb89a9-3336-46d5-86fb-038463ec3e17.png" "Human and AI hands with globe")"
M4="$(upload "$ASSETS/3909247-e0232609-3b08-468f-a2b2-1fccd425a57c.png" "Node.js galaxy logo")"
M5="$(upload "$ASSETS/ai-editor-0d7ac8e4-e056-49f2-a790-a2074b6645e9.png" "AI photo editor before and after")"

ID1="$(echo "$M1" | jq -r '.data.id // .id')"
ID2="$(echo "$M2" | jq -r '.data.id // .id')"
ID3="$(echo "$M3" | jq -r '.data.id // .id')"
ID4="$(echo "$M4" | jq -r '.data.id // .id')"
ID5="$(echo "$M5" | jq -r '.data.id // .id')"

for pair in "1:$ID1" "2:$ID2" "3:$ID3" "4:$ID4" "5:$ID5"; do
  idx="${pair%%:*}"
  id="${pair##*:}"
  if [[ -z "$id" || "$id" == "null" ]]; then
    echo "Upload $idx failed"
    eval "echo \"\$M$idx\""
    exit 1
  fi
  echo "Cover $idx → $id"
done

echo "==> Create articles with new covers"
create_publish \
  "Building in the cloud without losing the plot" \
  "building-in-the-cloud-${SUFFIX}" \
  "Modern teams ship faster when infrastructure stays invisible — and the product stays human." \
  "$ID1"

create_publish \
  "Node.js habits that keep production calm" \
  "nodejs-habits-${SUFFIX}" \
  "From event-loop basics to boring reliability: practices that still matter when traffic spikes." \
  "$ID2"

create_publish \
  "Where human judgment meets generative AI" \
  "human-judgment-meets-genai-${SUFFIX}" \
  "Models draft. Editors decide. A practical map for using AI without handing over your voice." \
  "$ID3"

create_publish \
  "JavaScript beyond the hype cycle" \
  "javascript-beyond-the-hype-${SUFFIX}" \
  "Frameworks come and go. Clear modules, tests, and ownership still win the long game." \
  "$ID4"

create_publish \
  "What AI photo tools get wrong (and right)" \
  "what-ai-photo-tools-get-wrong-${SUFFIX}" \
  "Before/after magic is fun — until trust breaks. How creators can use editing tools responsibly." \
  "$ID5"

echo "==> Public feed"
curl -sS "$GATEWAY/articles/public?limit=5" | jq '.data[] | {title, cover: .coverMedia.secureUrl}'
echo "Done."
