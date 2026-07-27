# CMS / Blogging Platform

|                  |                                                               |
| ---------------- | ------------------------------------------------------------- |
| **Slug**         | `cms-blogging`                                                |
| **Implement in** | `apps/api/` + `apps/web/` on branch `<dev-name>/cms-blogging` |

## Problem

Authors draft posts with revisions, tags, comments, and a publish workflow with SEO metadata.

## Personas / roles

- admin
- editor (staff)
- author (user)

## Suggested entities

- `User`
- `Article`
- `Revision`
- `Tag`
- `ArticleTag`
- `Comment`

## ERD (starter)

```mermaid
erDiagram
  User ||--o{ Article : authors
  Article ||--o{ Revision : versions
  Article }o--o{ Tag : tagged
  Article ||--o{ Comment : receives
  Article ||--o| Revision : publishedRevision
```

## Hard invariant

Public list shows only articles with publishedRevisionId set; publishing sets pointer in a transaction.

## Required transaction

Publish: create/select revision + set article.publishedRevisionId + publishedAt.

## Must (pass)

- [ ] Articles + revisions
- [ ] Publish workflow
- [ ] Tags N:N
- [ ] Comments on published articles
- [ ] Draft vs published lists
- [ ] Soft-delete articles

Plus the shared Must bar in [grading.md](../grading.md).

## Should (distinction)

- [ ] SEO fields (slug, meta title/description, OG image URL)
- [ ] Editor dashboard
- [ ] Markdown body (textarea — not full WYSIWYG required)
- [ ] Search by tag + q

## Stretch (bonus)

- [ ] TipTap/ProseMirror rich editor
- [ ] Scheduled publish
- [ ] CDN image pipeline

## API outline (indicative)

- `CRUD /articles`
- `POST /articles/:id/revisions`
- `POST /articles/:id/publish`
- `CRUD /tags`
- `POST /comments`

## FE routes (indicative)

- `/`
- `/blog`
- `/blog/[slug]`
- `/studio`
- `/studio/[id]`

## Definition of done

- Migrations + seed (≥8 realistic rows across core tables)
- Compose Postgres + project `.env`
- Next + Query + RTK ownership respected
- `docs/architecture.md` completed
- 5-minute demo script in the PR body (and notes in `docs/architecture.md`)

## Demo script (fill in)

1. Login as each role
2. Happy path for core workflow
3. Show invariant failure (expect 4xx)
4. Show list filters + soft-delete behaviour
