#!/usr/bin/env sh
# Local stack doctor - Postgres, env sanity, ports, and per-hop HTTP checks.
# Usage: pnpm doctor
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

WEB_PORT="${WEB_PORT:-3000}"
GATEWAY_PORT="${GATEWAY_PORT:-3001}"
API_PORT_DEFAULT="${API_PORT:-3002}"
POSTGRES_PORT="${POSTGRES_PORT:-5434}"

ok=0
fail=0
hop_api=0
hop_gw_health=0
hop_gw_proxy=0
hop_web=0

pass() {
  ok=$((ok + 1))
  printf '  OK  %s\n' "$1"
}

warn() {
  printf '  WARN %s\n' "$1"
}

bad() {
  fail=$((fail + 1))
  printf '  FAIL %s\n' "$1"
}

# check_hop <result_var> <label> <url> <hint>
check_hop() {
  result_var="$1"
  label="$2"
  url="$3"
  hint="$4"
  code="$(http_code "$url")"
  if [ "$code" = "200" ]; then
    pass "${label} → HTTP ${code}  ${url}"
    eval "${result_var}=1"
  else
    bad "${label} → HTTP ${code}  ${url}"
    printf '       hint: %s\n' "$hint"
    eval "${result_var}=0"
  fi
}

port_listening() {
  port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -tln 2>/dev/null | grep -qE ":${port}\\b"
    return $?
  fi
  if command -v nc >/dev/null 2>&1; then
    nc -z localhost "$port" >/dev/null 2>&1
    return $?
  fi
  return 1
}

http_code() {
  url="$1"
  # curl prints 000 and exits non-zero on connect failure — do not append another 000.
  code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 2 --max-time 5 "$url" 2>/dev/null || true)"
  if [ -z "$code" ]; then
    printf '000'
  else
    printf '%s' "$code"
  fi
}

env_val() {
  file="$1"
  key="$2"
  if [ ! -f "$file" ]; then
    printf ''
    return
  fi
  # shellcheck disable=SC2002
  cat "$file" | grep -E "^${key}=" | head -n 1 | cut -d= -f2- | tr -d '\r'
}

api_port_env="$(env_val apps/api/.env PORT)"
api_port_env="${api_port_env:-$API_PORT_DEFAULT}"

printf 'Doctor - fullstack local stack\n'
printf 'Canonical ports: web %s / gateway %s / api %s / postgres %s\n' \
  "$WEB_PORT" "$GATEWAY_PORT" "$API_PORT_DEFAULT" "$POSTGRES_PORT"
if [ "$api_port_env" != "$API_PORT_DEFAULT" ]; then
  printf 'This checkout: api PORT=%s (keep API_UPSTREAM_URL / API_GATEWAY_URL in sync)\n' "$api_port_env"
fi
printf '\n'

printf 'Env files\n'
for f in .env apps/api-gateway/.env apps/api/.env apps/web/.env.local; do
  if [ -f "$f" ]; then
    pass "$f present"
  else
    bad "$f missing (copy from the matching .env.example / .env.local.example)"
  fi
done

gw_secret="$(env_val apps/api-gateway/.env JWT_SECRET)"
api_secret="$(env_val apps/api/.env JWT_SECRET)"
if [ -n "$gw_secret" ] && [ -n "$api_secret" ]; then
  if [ "$gw_secret" = "$api_secret" ]; then
    pass 'JWT_SECRET matches between api-gateway and api'
  else
    bad 'JWT_SECRET differs between apps/api-gateway/.env and apps/api/.env'
  fi
elif [ -f apps/api-gateway/.env ] && [ -f apps/api/.env ]; then
  bad 'JWT_SECRET missing in gateway or api .env'
fi

gw_upstream="$(env_val apps/api-gateway/.env API_UPSTREAM_URL)"
if [ -n "$gw_upstream" ]; then
  case "$gw_upstream" in
    *"localhost:${api_port_env}"*|*"127.0.0.1:${api_port_env}"*)
      pass "API_UPSTREAM_URL points at api PORT (${api_port_env})"
      ;;
    *)
      warn "API_UPSTREAM_URL=${gw_upstream} - expected host port ${api_port_env} (ok if intentional)"
      ;;
  esac
fi

printf '\nPostgres\n'
if [ -f .env ]; then
  compose="docker compose --env-file .env -f docker/docker-compose.yml"
else
  compose="docker compose -f docker/docker-compose.yml"
fi

if $compose ps 2>/dev/null | grep -q 'postgres'; then
  status="$($compose ps --format '{{.Status}}' 2>/dev/null | head -n 1 || true)"
  if printf '%s' "$status" | grep -qi healthy; then
    pass "compose postgres healthy (${status})"
  elif printf '%s' "$status" | grep -qi up; then
    warn "compose postgres up but not healthy yet (${status})"
  else
    bad "compose postgres not healthy (${status:-unknown})"
  fi
else
  bad 'compose postgres not running - run: pnpm docker:db'
fi

if port_listening "$POSTGRES_PORT"; then
  pass "host port ${POSTGRES_PORT} is listening"
else
  bad "host port ${POSTGRES_PORT} is not listening"
fi

printf '\nApp ports\n'
if port_listening "$WEB_PORT"; then
  pass "web :${WEB_PORT} listening"
else
  warn "web :${WEB_PORT} free - start with pnpm dev (or pnpm dev:web)"
fi

if port_listening "$GATEWAY_PORT"; then
  pass "gateway :${GATEWAY_PORT} listening"
else
  warn "gateway :${GATEWAY_PORT} free - start with pnpm dev (or pnpm dev:gateway)"
fi

if port_listening "$api_port_env"; then
  pass "api :${api_port_env} listening"
else
  warn "api :${api_port_env} free - start with pnpm dev (or pnpm dev:api)"
fi

if [ "$api_port_env" != "$API_PORT_DEFAULT" ] && port_listening "$API_PORT_DEFAULT"; then
  warn "canonical :${API_PORT_DEFAULT} is in use by something else (your api uses PORT=${api_port_env})"
fi

printf '\nHops (which layer failed?)\n'
check_hop hop_api \
  '1 api' \
  "http://localhost:${api_port_env}/ready" \
  "domain api not reachable — start with: pnpm dev:api (PORT=${api_port_env})"

check_hop hop_gw_health \
  '2 gateway' \
  "http://localhost:${GATEWAY_PORT}/health" \
  "gateway process not reachable — start with: pnpm dev:gateway"

check_hop hop_gw_proxy \
  '3 gateway→api proxy' \
  "http://localhost:${GATEWAY_PORT}/ready" \
  "gateway up but proxy to api failed — check API_UPSTREAM_URL vs api PORT=${api_port_env}"

check_hop hop_web \
  '4 Next rewrite' \
  "http://localhost:${WEB_PORT}/api/ready" \
  "web rewrite path failed — start pnpm dev:web; check API_GATEWAY_URL → :${GATEWAY_PORT}"

printf '\nDiagnosis\n'
if [ "$hop_api" -eq 1 ] && [ "$hop_gw_health" -eq 1 ] && [ "$hop_gw_proxy" -eq 1 ] && [ "$hop_web" -eq 1 ]; then
  printf '  → all hops OK (api → gateway → Next rewrite)\n'
elif [ "$hop_api" -eq 0 ]; then
  printf '  → first break: domain api (hop 1)\n'
elif [ "$hop_gw_health" -eq 0 ]; then
  printf '  → first break: api gateway (hop 2)\n'
elif [ "$hop_gw_proxy" -eq 0 ]; then
  printf '  → first break: gateway → api proxy / API_UPSTREAM_URL (hop 3)\n'
elif [ "$hop_web" -eq 0 ]; then
  printf '  → first break: Next /api rewrite or web not running (hop 4)\n'
fi

printf '\nSummary: %s passed, %s failed\n' "$ok" "$fail"
if [ "$fail" -gt 0 ]; then
  printf 'Fix FAIL lines (start from the first broken hop), then re-run: pnpm doctor\n'
  printf 'Typical bring-up: pnpm docker:db && pnpm migration:run && pnpm seed && pnpm dev\n'
  exit 1
fi
printf 'Stack looks good. Open http://localhost:%s\n' "$WEB_PORT"
exit 0
