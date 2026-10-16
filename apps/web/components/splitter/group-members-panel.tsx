'use client';

import { useMemo, useState } from 'react';
import { Button, TextInput } from '@shared/ui/components';
import { Avatar } from './avatar';
import { PaginationBar } from './pagination-bar';

export type GroupMemberRow = {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'member' | string;
};

const PAGE_SIZE = 8;

type GroupMembersPanelProps = Readonly<{
  members: GroupMemberRow[];
  currentUserId?: string;
  canRemove: boolean;
  onRemove: (userId: string) => void;
}>;

export function GroupMembersPanel({
  members,
  currentUserId,
  canRemove,
  onRemove,
}: GroupMembersPanelProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = expanded
    ? filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : filtered.slice(0, Math.min(PAGE_SIZE, filtered.length));

  const collapsedPreview = !expanded && filtered.length > PAGE_SIZE;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Members</h3>
          <p className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? 'person' : 'people'} in this group
          </p>
        </div>
        <TextInput
          aria-label="Search members"
          placeholder="Search members…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No members match “{query.trim()}”.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
          <ul className="divide-y divide-border">
            {visible.map((member) => {
              const isYou = member.userId === currentUserId;
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={member.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {member.name}
                        {isYou ? (
                          <span className="ml-1.5 font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {canRemove && !isYou ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(member.userId)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          {collapsedPreview ? (
            <div className="border-t border-border px-3 py-2.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setExpanded(true)}
              >
                View all {filtered.length} members
              </Button>
            </div>
          ) : null}

          {expanded ? (
            <div className="space-y-2 px-3 pb-3">
              <PaginationBar
                page={safePage}
                totalPages={totalPages}
                total={filtered.length}
                limit={PAGE_SIZE}
                label="members"
                onPageChange={setPage}
              />
              {members.length <= PAGE_SIZE ? null : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setExpanded(false);
                    setPage(1);
                  }}
                >
                  Collapse
                </Button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
