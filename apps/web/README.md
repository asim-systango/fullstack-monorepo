# Fullstack web

Next App Router shell with auth pages and Query/RTK providers.

Add your domain routes under `app/`. Keep Nest as the product API.

Copy `.env.local.example` → `.env.local` (Next loads `.env.local` for local
overrides). Point `NEXT_PUBLIC_API_URL` at the Nest API; responses are `{ data: T }`
— prefer `@repo/api-client` which unwraps.
