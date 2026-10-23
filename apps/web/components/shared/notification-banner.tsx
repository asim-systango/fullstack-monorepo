'use client';

import { Alert } from '@shared/ui';
import type { Notification } from '@/lib/hooks/use-notification';

interface NotificationBannerProps {
    notification: Notification | null;
    onDismiss: () => void;
}

export function NotificationBanner({ notification, onDismiss }: Readonly<NotificationBannerProps>) {
    if (!notification) return null;

    return (
        <div className="relative">
            <Alert
                tone={notification.type === 'success' ? 'success' : 'danger'}
                className="text-xs mb-5 flex items-center justify-between"
            >
                <span>{notification.message}</span>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="ml-3 text-zinc-400 hover:text-white transition font-bold text-sm cursor-pointer"
                >
                    &#x2715;
                </button>
            </Alert>
        </div>
    );
}
