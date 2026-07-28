# Frontend (web UI)

How learners should build UI in this starter.

## Where things live

| Piece                                       | Path                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| Pages / routes                              | `apps/web/app/`                                               |
| App-only components (auth shell, providers) | `apps/web/components/`                                        |
| Shared primitives                           | `libs/ui` → import `@shared/ui/components`                    |
| Design theme (tokens + `.ui-*` recipes)     | `libs/ui/src/theme/` → `@shared/ui/theme.css`                 |
| Web CSS entry                               | `apps/web/styles/globals.css` (Tailwind + theme + `base.css`) |
| Live gallery                                | [http://localhost:3000/ui](http://localhost:3000/ui)          |

## Import convention

Prefer **folder subpaths** on `@shared/*` packages (and app-local folders with `index.ts`):

| Pattern       | Example                                                              |
| ------------- | -------------------------------------------------------------------- |
| UI components | `import { Button } from '@shared/ui/components'`                     |
| Theme CSS     | `import '@shared/ui/theme.css'`                                      |
| HTTP helpers  | `from '@shared/http/filters'` / `@shared/http/interceptors`          |
| Env by app    | `from '@shared/env/gateway'` / `@shared/env/api` / `@shared/env/web` |
| Flat packages | `from '@shared/types'` until a real folder exists                    |
| App-local     | `from '@/components/auth'`                                           |

Root package entrypoints (e.g. `@shared/ui`) remain as thin re-exports; folder paths are preferred.

When you add a new folder under a lib, add `index.ts` and a matching `exports["./folder"]` in that package’s `package.json`.

## Rules

1. Prefer **`@shared/ui/components`** over one-off markup for buttons, forms, cards, tables, dialogs, alerts, empty/loading states.
2. Prefer **semantic theme tokens** (`bg-background`, `text-muted-foreground`, `bg-primary`) — do not invent hex colors in pages.
3. Change look-and-feel in **`libs/ui/src/theme/`** (primitives → colors → tokens → `components.css`). Shared theme changes affect every project — keep them intentional.
4. **Ink / paper:** `primary` = near-black ink; `accent` = blue for **links and focus only** — not primary buttons.
5. Keep **empty ≠ loading ≠ error** (stack rule #8): use `LoadingState` / `EmptyState` / `Alert` or `StatusMessage`.
6. Browser talks only to **`/api` on `:3000`** — never call the domain API port from the client.

## Import examples

```tsx
import {
  Button,
  Field,
  Form,
  LoadingState,
  Skeleton,
  TextInput,
} from '@shared/ui/components';

function CreateJobForm({ pending, onSubmit }: { pending: boolean; onSubmit: … }) {
  return (
    <Form pending={pending} onSubmit={onSubmit}>
      <Field label="Title" htmlFor="title" required disabled={pending}>
        <TextInput id="title" name="title" />
      </Field>
      <Button type="submit" loading={pending} loadingText="Saving…">
        Create
      </Button>
    </Form>
  );
}

// Lists: loading → LoadingState / Skeleton; empty → EmptyState; else content
```

```tsx
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  LoadingState,
  Page,
  PageHeader,
  Select,
  Table,
  TextInput,
} from '@shared/ui/components';
```

```tsx
export default function JobsPage() {
  return (
    <Page>
      <PageHeader
        title="Jobs"
        description="Open roles"
        actions={<Button>New job</Button>}
      />
      {/* Query loading → LoadingState; empty → EmptyState; else Table */}
    </Page>
  );
}
```

## Component map

See [`libs/ui/README.md`](../libs/ui/README.md) for the full table (`Button` + `loading`, `Form` + `pending`, `Field`, inputs with `invalid`/`name`/`required`, `Skeleton`, `LoadingState`, …).

## Extending the kit

1. Add or adjust a recipe in `libs/ui/src/theme/components.css` (`.ui-…` classes).
2. Add a thin React wrapper under `libs/ui/src/components/`.
3. Export it from `libs/ui/src/components/index.ts` (root `src/index.ts` re-exports the folder).
4. Show it on `/ui` so others can copy the pattern.

Theme file roles: [`libs/ui/src/theme/README.md`](../libs/ui/src/theme/README.md).

## Related

- [Stack rules](./stack.md) (rule 12)
- [Architecture](./architecture.md)
- [Web app README](../apps/web/README.md)
