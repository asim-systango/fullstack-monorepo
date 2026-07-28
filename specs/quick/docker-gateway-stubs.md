# specs/quick/docker-gateway-stubs.md

## Goal

Align Docker stubs with the three-app BFF stack: add `Dockerfile.gateway`, refresh `Dockerfile.api` comments, and document web build-args for `NEXT_PUBLIC_API_URL` / `API_GATEWAY_URL`. Compose stays Postgres-only.

## Files likely touched

- `docker/Dockerfile.gateway` (new)
- `docker/Dockerfile.api`
- `docker/Dockerfile.web`
- `docs/architecture.md` (docker/ row)

## Acceptance criteria

- [x] Gateway stub builds `@fullstack/api-gateway` (mirrors api stub)
- [x] Api stub comment reflects domain API, not “the Nest API”
- [x] Web stub documents/sets build-args for `/api` + gateway rewrite target
- [x] Compose remains Postgres-only; architecture notes three Dockerfile stubs

## Verification

- [x] Dockerfiles exist and reference the correct package filters
- [x] Docs mention stubs without claiming compose runs the apps

## Noticed but not touched

- Full-stack compose services for gateway/api/web (intentionally out of scope)
- Next Docker build still warns about missing `eslint-plugin-react-hooks` during lint step but completes successfully
