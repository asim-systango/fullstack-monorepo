import { useState, useEffect } from 'react';

export interface Notification {
    message: string;
    type: 'success' | 'error';
}

export function useNotification(autoDismissMs = 4000) {
    const [notification, setNotification] = useState<Notification | null>(null);

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), autoDismissMs);
        return () => clearTimeout(timer);
    }, [notification, autoDismissMs]);

    return {
        notification,
        setNotification,
        clearNotification: () => setNotification(null),
    };
}
