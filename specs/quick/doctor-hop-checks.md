# doctor-hop-checks

## Goal

Extend `pnpm doctor` so it probes each hop in the request path (api → gateway health → gateway proxy → Next rewrite) and names which layer failed, instead of only checking the full-path smoke URL.

## Files likely touched

- `tools/scripts/doctor.sh`
- `README.md` (doctor one-liner)

## Acceptance criteria

- [x] Doctor prints separate HTTP checks for api `/ready`, gateway `/health`, gateway `/ready` (proxy), and web `/api/ready`
- [x] Failures include a short hint naming the broken layer
- [x] Existing env / Postgres / port checks still run
- [x] README mentions hop-aware doctor

## Verification

- [x] `pnpm doctor` runs and shows the Hops section (pass or fail per layer as stack state allows)
- [x] Script exits non-zero when a hop returns non-200 (when stack partially down)

## Noticed but not touched

- VS Code launch.json, request IDs, DEBUG_PROXY (from earlier debugging list)
- HTTP `000000` curl quirk fixed in the same doctor change (was pre-existing)
