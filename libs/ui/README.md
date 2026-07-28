# @shared/ui

Shared presentational primitives for `@app/web` (Button, Card, Field, inputs, StatusMessage).

Styled with **Tailwind utility classes** that resolve against the web app theme tokens (`bg-primary`, `text-muted-foreground`, etc.). The web app must:

1. Import Tailwind in `apps/web/styles/globals.css`
2. Include `@source` pointing at this package so classes are generated

Also exports `cn()` (`clsx` + `tailwind-merge`) for class composition.
