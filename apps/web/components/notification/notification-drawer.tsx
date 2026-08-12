'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Check, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import { Badge, Spinner } from '@shared/ui/components';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        const items = json.data || json;
        if (Array.isArray(items)) {
          setNotifications(items);
        }
      }
    } catch {
      // Ignore network errors on background poll
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // ignore error
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore error
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_SCHEDULED':
        return <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'APPOINTMENT_CANCELLED':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'REMINDER':
        return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  const renderContent = (): React.ReactNode => {
    if (isLoading && notifications.length === 0) {
      return (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Spinner size="sm" className="text-primary" />
          <p className="text-xs text-muted-foreground">Loading notifications...</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
          <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p>No notifications yet</p>
        </div>
      );
    }

    return (
      <>
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3 text-xs transition-colors flex items-start gap-3 ${
              !item.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/20'
            }`}
          >
            {getNotificationIcon(item.type)}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{item.title}</p>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {item.message}
              </p>
            </div>
            {!item.isRead && (
              <button
                type="button"
                onClick={() => markAsRead(item.id)}
                title="Mark as read"
                className="text-muted-foreground hover:text-primary p-1"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2">
          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-semibold text-xs text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge tone="accent" className="text-[10px] px-1.5 py-0.5">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
