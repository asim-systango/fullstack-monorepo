# @shared/ui

Presentational primitives for `@app/web`. Prefer `import { Button } from '@shared/ui/components'`. Styles come from [`src/theme/`](./src/theme/) via `@shared/ui/theme.css`.

Learner guide: [docs/frontend.md](../../docs/frontend.md). Live gallery: **`/ui`**.

## Components

| Component                                                                            | Use for                                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `Button`                                                                             | Actions — `loading` / `loadingText`, variants, sizes                   |
| `Form`                                                                               | `<form>` wrapper — `pending` sets `aria-busy`                          |
| `Field`                                                                              | Label + hint/error/required/optional; wires `invalid` onto the control |
| `TextInput` / `TextArea` / `Select` / `Checkbox`                                     | Controls — `name`, `required`, `disabled`, `readOnly`, `invalid`       |
| `Card` (+ header/body/footer)                                                        | Panels                                                                 |
| `Badge`                                                                              | Status chips                                                           |
| `Alert` / `StatusMessage`                                                            | Page vs inline feedback                                                |
| `Spinner` / `LoadingState` / `Skeleton`                                              | Loading (≠ empty ≠ error)                                              |
| `EmptyState`                                                                         | Empty lists                                                            |
| `Page` / `PageHeader`                                                                | Page chrome                                                            |
| `Separator`                                                                          | Section dividers                                                       |
| `Dialog` / `Modal` (+ header/title/body/footer)                                      | Modal dialogs (`<dialog>` + `showModal`)                               |
| `Table` (+ `TableHead` / `TableBody` / `TableRow` / `TableHeaderCell` / `TableCell`) | Data tables                                                            |
| `cn`                                                                                 | Class merging (also on package root)                                   |

**Rule:** change tokens / `.ui-*` recipes in `src/theme/`; keep React wrappers thin. Do not hardcode hex in pages.

## Package exports

| Subpath                 | Points to                             |
| ----------------------- | ------------------------------------- |
| `@shared/ui/components` | `src/components/index.ts` (preferred) |
| `@shared/ui`            | Root re-export (thin)                 |
| `@shared/ui/theme.css`  | `src/theme/index.css`                 |
