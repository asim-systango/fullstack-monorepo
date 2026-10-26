'use client';

import { Button, Field, Select, TextInput } from '@shared/ui/components';
import { applyFilter, setFilterDraft, useAppDispatch, useAppSelector } from '@/lib/store';
import type { Template } from '@/lib/resume-types';

export function ResumeFilters({ templates }: Readonly<{ templates: Template[] }>) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.ui.filterDraft);

  return (
    <form
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(applyFilter());
      }}
    >
      <Field label="Status" htmlFor="filter-status" className="min-w-[9rem]">
        <Select
          id="filter-status"
          value={draft.status}
          onChange={(e) =>
            dispatch(
              setFilterDraft({
                status: e.target.value as typeof draft.status,
              }),
            )
          }
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
      </Field>
      <Field label="Template" htmlFor="filter-template" className="min-w-[10rem]">
        <Select
          id="filter-template"
          value={draft.templateId}
          onChange={(e) => dispatch(setFilterDraft({ templateId: e.target.value }))}
        >
          <option value="">All</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.key})
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Search title" htmlFor="filter-q" className="min-w-[12rem] flex-1">
        <TextInput
          id="filter-q"
          value={draft.q}
          onChange={(e) => dispatch(setFilterDraft({ q: e.target.value }))}
          placeholder="Search…"
        />
      </Field>
      <Button type="submit" variant="secondary">
        Apply filters
      </Button>
    </form>
  );
}
