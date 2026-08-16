'use client';

import { useState, type SyntheticEvent } from 'react';
import type { Message, Ticket } from '@shared/api-client';
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Spinner,
  TextArea,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { useCreateMessage } from '@/lib/hooks/use-ticket-detail';

function getRoleTone(role: string) {
  if (role === 'admin') return 'danger';
  if (role === 'staff') return 'accent';
  return 'neutral';
}

function getMessageCardClass(isInternal: boolean, isStaffMsg: boolean) {
  if (isInternal) return 'border-amber-500/50 bg-amber-500/10';
  if (isStaffMsg) return 'border-blue-500/30 bg-blue-500/5';
  return 'bg-card';
}

export function TicketThread({
  ticket,
  messages,
  isLoadingMessages,
}: Readonly<{
  ticket: Ticket;
  messages: Message[];
  isLoadingMessages: boolean;
}>) {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';
  const isClosed = ticket.status === 'closed';

  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessageMutation = useCreateMessage(ticket.id);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!body.trim()) {
      setError('Message body cannot be empty.');
      return;
    }

    createMessageMutation.mutate(
      {
        body: body.trim(),
        isInternal: isStaffOrAdmin ? isInternal : false,
      },
      {
        onSuccess: () => {
          setBody('');
          setIsInternal(false);
        },
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to send message. Please try again.',
          );
        },
      },
    );
  };

  let threadContent;
  if (isLoadingMessages) {
    threadContent = (
      <Card className="flex items-center justify-center p-8">
        <Spinner label="Loading conversation thread..." />
      </Card>
    );
  } else if (messages.length === 0) {
    threadContent = (
      <Card className="p-6 text-center text-muted-foreground">
        No messages yet in this thread.
      </Card>
    );
  } else {
    threadContent = (
      <div className="space-y-4">
        {messages.map((msg) => {
          const senderRole = msg.sender?.role ?? 'user';
          const isStaffMsg = senderRole === 'staff' || senderRole === 'admin';

          return (
            <Card
              key={msg.id}
              className={`p-5 ${getMessageCardClass(msg.isInternal, isStaffMsg)}`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-border">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-foreground">
                    {msg.sender?.name ?? msg.sender?.email ?? 'Unknown User'}
                  </span>
                  <Badge tone={getRoleTone(senderRole)}>{senderRole.toUpperCase()}</Badge>
                  {msg.isInternal && (
                    <Badge tone="danger" className="ml-2">
                      INTERNAL NOTE
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                {msg.body}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-foreground">Activity & Messages</h3>
      {threadContent}

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 text-foreground">Post a Reply</h4>

        {isClosed ? (
          <Alert tone="neutral" title="Ticket Closed">
            This ticket is closed. Replies are disabled on resolved/closed tickets.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert tone="danger">{error}</Alert>}

            <Field label="Your Message" required htmlFor="reply-body">
              <TextArea
                id="reply-body"
                rows={4}
                placeholder="Type your response here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </Field>

            {isStaffOrAdmin && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="internal-note"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="internal-note"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Internal Note (Visible only to support staff)
                </label>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={createMessageMutation.isPending}
                loadingText="Sending message..."
              >
                Send Reply
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
