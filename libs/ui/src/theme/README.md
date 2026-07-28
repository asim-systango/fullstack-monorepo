# Theme (`@shared/ui/theme`)

CSS-first **ink / paper** design system for Tailwind v4. Import via `@shared/ui/theme.css` from the web app entry stylesheet.

Learner overview: [docs/frontend.md](../../../../docs/frontend.md). Component gallery: web `/ui`.

## Layers

```
primitives.css (OKLCH scales)
  → colors.css (semantic light/dark roles)
    → tokens.css (@theme → Tailwind utilities)
      → components.css (.ui-* recipes)
        → React wrappers in libs/ui/src/components/
```

| File             | Role                                                        |
| ---------------- | ----------------------------------------------------------- |
| `primitives.css` | OKLCH scales: ink, paper, scarce blue, status               |
| `colors.css`     | Semantic roles (`--primary`, `--accent`, …) light + `.dark` |
| `tokens.css`     | `@theme inline` → `bg-primary`, `text-accent`, …            |
| `typography.css` | `font-sans` / `font-mono`; fluid `--text-page-title`        |
| `radius.css`     | `rounded-sm` / `md` / `lg` / `xl`                           |
| `shadows.css`    | Low elevation `shadow-sm` / `md`                            |
| `motion.css`     | `--duration-fast` / `normal`, `--ease-standard`             |
| `variants.css`   | Class-based `.dark` variant                                 |
| `components.css` | `@layer components` recipes (`.ui-button`, …)               |

## Ink / paper rules

- **Primary = ink** (near-black fills for buttons / strong UI) — not blue.
- **Accent = blue** — links, focus ring (`--ring`), info alerts only.
- Prefer **hairline borders** + soft shadows over glass/glow.
- Retokenize by editing primitives → semantic mapping; keep React on semantic utilities / `.ui-*`.

**Do not** hardcode hex in React. No purple / cream+terracotta clichés.
