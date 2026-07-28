# Food Delivery Platform

|                  |                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **Slug**         | `food-delivery`                                                                             |
| **Implement in** | `apps/api/` + `apps/web/` (auth on `apps/api-gateway`) on branch `<dev-name>/food-delivery` |

## Problem

Restaurants publish menus; customers cart and place orders; status progresses through delivery.

## Personas / roles

- admin
- restaurant (staff)
- customer (user)

## Suggested entities

- Auth `User` is on the gateway — use `userId` FKs; do **not** recreate users/auth in `apps/api`
- `Restaurant`
- `MenuItem`
- `CartItem`
- `Order`
- `OrderLine`
- `DeliveryStatus`

## ERD (starter)

```mermaid
erDiagram
  User ||--o| Restaurant : owns
  Restaurant ||--o{ MenuItem : serves
  User ||--o{ CartItem : carts
  MenuItem ||--o{ CartItem : in
  User ||--o{ Order : places
  Order ||--o{ OrderLine : contains
  Order ||--o{ DeliveryStatus : tracks
```

## Hard invariant

Orders only from one restaurant per cart; status transitions are one-way along a defined path.

## Required transaction

Place order: create Order + lines from cart + clear cart.

## Must (pass)

- [ ] Restaurant + menu CRUD
- [ ] Cart scoped to one restaurant
- [ ] Place order with status placed
- [ ] Status updates (placed → preparing → out_for_delivery → delivered|cancelled)
- [ ] List orders + filter by status
- [ ] Soft-delete menu items

Plus the shared Must bar in [grading.md](../grading.md).

## Should (distinction)

- [ ] Admin + restaurant dashboards
- [ ] Delivery status history timeline
- [ ] Estimated minutes field
- [ ] Search restaurants by cuisine/q

## Stretch (bonus)

- [ ] Live geo tracking / WebSockets
- [ ] Driver app
- [ ] Real payments

## API outline (indicative)

- `CRUD /restaurants`
- `CRUD /menu-items`
- `CRUD /cart`
- `POST /orders`
- `PATCH /orders/:id/status`

## FE routes (indicative)

- `/`
- `/restaurants`
- `/restaurants/[id]`
- `/cart`
- `/orders`
- `/restaurant/dashboard`

## Definition of done

- Domain migrations (`pnpm migration:run:api`) + domain seed (≥8 realistic rows); gateway users via `pnpm seed`
- Compose Postgres + root `.env` + `apps/api-gateway/.env` + `apps/api/.env` + `apps/web/.env.local`
- Next + Query + RTK ownership respected; UI uses `@shared/ui/components` + theme ([frontend.md](../frontend.md))
- `docs/architecture.md` completed
- 5-minute demo script in the PR body (and notes in `docs/architecture.md`)

## Demo script (fill in)

1. Login as each role
2. Happy path for core workflow
3. Show invariant failure (expect 4xx)
4. Show list filters + soft-delete behaviour
