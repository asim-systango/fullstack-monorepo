'use client';

import { Button, Field, Select, TextArea, TextInput } from '@shared/ui/components';
import {
  addItem,
  addSection,
  moveItem,
  moveSection,
  removeItem,
  removeSection,
  setTemplate,
  updateFields,
  updateItem,
  updateSection,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';
import { SECTION_TYPE_LABELS, type SectionType, type Template } from '@/lib/resume-types';

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[];

export function ResumeEditorForm({ templates }: Readonly<{ templates: Template[] }>) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.resumeDraft.draft);
  const activeTemplates = templates.filter((t) => t.isActive);

  if (!draft) return null;

  const sections = [...draft.sections].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Basics
        </h2>
        <Field label="Resume title" htmlFor="draft-title">
          <TextInput
            id="draft-title"
            value={draft.title}
            onChange={(e) => dispatch(updateFields({ title: e.target.value }))}
          />
        </Field>
        <Field label="Template" htmlFor="draft-template">
          <Select
            id="draft-template"
            value={draft.templateId}
            onChange={(e) => {
              const t = templates.find((x) => x.id === e.target.value);
              if (!t) return;
              dispatch(
                setTemplate({
                  templateId: t.id,
                  templateKey: t.key,
                  templateName: t.name,
                }),
              );
            }}
          >
            {activeTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.key})
              </option>
            ))}
            {!activeTemplates.some((t) => t.id === draft.templateId) &&
            draft.templateId ? (
              <option value={draft.templateId}>
                {draft.templateName || 'Current'} ({draft.templateKey})
              </option>
            ) : null}
          </Select>
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact
        </h2>
        <Field label="Full name" htmlFor="draft-fullName">
          <TextInput
            id="draft-fullName"
            value={draft.fullName}
            onChange={(e) => dispatch(updateFields({ fullName: e.target.value }))}
          />
        </Field>
        <Field label="Email" htmlFor="draft-email">
          <TextInput
            id="draft-email"
            type="email"
            value={draft.email}
            onChange={(e) => dispatch(updateFields({ email: e.target.value }))}
          />
        </Field>
        <Field label="Phone" htmlFor="draft-phone">
          <TextInput
            id="draft-phone"
            value={draft.phone}
            onChange={(e) => dispatch(updateFields({ phone: e.target.value }))}
          />
        </Field>
        <Field label="Location" htmlFor="draft-location">
          <TextInput
            id="draft-location"
            value={draft.location}
            onChange={(e) => dispatch(updateFields({ location: e.target.value }))}
          />
        </Field>
        <Field label="Summary" htmlFor="draft-summary">
          <TextArea
            id="draft-summary"
            rows={4}
            value={draft.summary}
            onChange={(e) => dispatch(updateFields({ summary: e.target.value }))}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Sections
          </h2>
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => dispatch(addSection({ type }))}
              >
                + {SECTION_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sections yet. Add Experience or Education to publish later.
          </p>
        ) : null}

        {sections.map((section, sectionIndex) => {
          const items = [...section.items].sort((a, b) => a.position - b.position);
          return (
            <div
              key={section.id}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex flex-wrap items-end gap-2">
                <Field
                  label="Section title"
                  htmlFor={`section-title-${section.id}`}
                  className="min-w-[10rem] flex-1"
                >
                  <TextInput
                    id={`section-title-${section.id}`}
                    value={section.title}
                    onChange={(e) =>
                      dispatch(
                        updateSection({
                          sectionId: section.id,
                          patch: { title: e.target.value },
                        }),
                      )
                    }
                  />
                </Field>
                <Field
                  label="Type"
                  htmlFor={`section-type-${section.id}`}
                  className="min-w-[8rem]"
                >
                  <Select
                    id={`section-type-${section.id}`}
                    value={section.type}
                    onChange={(e) =>
                      dispatch(
                        updateSection({
                          sectionId: section.id,
                          patch: { type: e.target.value as SectionType },
                        }),
                      )
                    }
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {SECTION_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-1 pb-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={sectionIndex === 0}
                    onClick={() =>
                      dispatch(
                        moveSection({
                          sectionId: section.id,
                          direction: 'up',
                        }),
                      )
                    }
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={sectionIndex === sections.length - 1}
                    onClick={() =>
                      dispatch(
                        moveSection({
                          sectionId: section.id,
                          direction: 'down',
                        }),
                      )
                    }
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => dispatch(removeSection({ sectionId: section.id }))}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pl-2">
                {items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="space-y-2 rounded-md border border-dashed border-border p-3"
                  >
                    <Field label="Heading" htmlFor={`item-heading-${item.id}`}>
                      <TextInput
                        id={`item-heading-${item.id}`}
                        value={item.heading}
                        onChange={(e) =>
                          dispatch(
                            updateItem({
                              sectionId: section.id,
                              itemId: item.id,
                              patch: { heading: e.target.value },
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Subheading" htmlFor={`item-sub-${item.id}`}>
                      <TextInput
                        id={`item-sub-${item.id}`}
                        value={item.subheading}
                        onChange={(e) =>
                          dispatch(
                            updateItem({
                              sectionId: section.id,
                              itemId: item.id,
                              patch: { subheading: e.target.value },
                            }),
                          )
                        }
                      />
                    </Field>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Start" htmlFor={`item-start-${item.id}`}>
                        <TextInput
                          id={`item-start-${item.id}`}
                          value={item.startDate}
                          onChange={(e) =>
                            dispatch(
                              updateItem({
                                sectionId: section.id,
                                itemId: item.id,
                                patch: { startDate: e.target.value },
                              }),
                            )
                          }
                          placeholder="2020"
                        />
                      </Field>
                      <Field label="End" htmlFor={`item-end-${item.id}`}>
                        <TextInput
                          id={`item-end-${item.id}`}
                          value={item.endDate}
                          onChange={(e) =>
                            dispatch(
                              updateItem({
                                sectionId: section.id,
                                itemId: item.id,
                                patch: { endDate: e.target.value },
                              }),
                            )
                          }
                          placeholder="Present"
                        />
                      </Field>
                    </div>
                    <Field label="Description" htmlFor={`item-desc-${item.id}`}>
                      <TextArea
                        id={`item-desc-${item.id}`}
                        rows={3}
                        value={item.description}
                        onChange={(e) =>
                          dispatch(
                            updateItem({
                              sectionId: section.id,
                              itemId: item.id,
                              patch: { description: e.target.value },
                            }),
                          )
                        }
                      />
                    </Field>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={itemIndex === 0}
                        onClick={() =>
                          dispatch(
                            moveItem({
                              sectionId: section.id,
                              itemId: item.id,
                              direction: 'up',
                            }),
                          )
                        }
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={itemIndex === items.length - 1}
                        onClick={() =>
                          dispatch(
                            moveItem({
                              sectionId: section.id,
                              itemId: item.id,
                              direction: 'down',
                            }),
                          )
                        }
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          dispatch(
                            removeItem({
                              sectionId: section.id,
                              itemId: item.id,
                            }),
                          )
                        }
                      >
                        Remove item
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => dispatch(addItem({ sectionId: section.id }))}
                >
                  Add item
                </Button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
