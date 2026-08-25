'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card } from '@shared/ui/components';
import {
  useNotifications,
  useMarkNotificationAsRead,
} from '@/lib/hooks/use-notifications';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleNotificationClick = (id: string, readAt?: string | null) => {
    if (!readAt) {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-xl border border-border p-2">
            <div className="flex items-center justify-between p-2 border-b border-border mb-2">
              <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <Badge tone="accent" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground text-center italic">
                No notifications yet.
              </p>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={`/tickets/${notification.ticketId}`}
                    onClick={() => {
                      handleNotificationClick(notification.id, notification.readAt);
                      setIsOpen(false);
                    }}
                    className={`block p-2 rounded transition-colors text-xs ${
                      notification.readAt
                        ? 'bg-card text-muted-foreground hover:bg-accent/10'
                        : 'bg-accent/10 text-foreground font-medium hover:bg-accent/20 border-l-2 border-primary'
                    }`}
                  >
                    <p className="font-semibold text-foreground">{notification.title}</p>
                    {notification.body && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
