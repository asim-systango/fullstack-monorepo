'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, CardTitle, CardDescription, Badge } from '@shared/ui';
import { useAuth } from './auth-provider';
import { UserRole } from '@/lib/auth/roles';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    fallbackUrl?: string;
}

export function RoleGuard({
    children,
    allowedRoles,
    fallbackUrl = '/dashboard',
}: RoleGuardProps) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
                <span className="text-sm font-medium">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const userRole = (user.role || '').toUpperCase();
    const isAllowed = allowedRoles.some((role) => role.toUpperCase() === userRole);

    if (!isAllowed) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
                    <CardHeader className="p-0 space-y-2">
                        <div className="text-3xl">🔒</div>
                        <CardTitle className="text-lg font-bold text-white">Access Denied</CardTitle>
                        <CardDescription className="text-xs text-zinc-400">
                            You don't have permission to access this page.
                        </CardDescription>
                    </CardHeader>
                    <CardBody className="p-0 space-y-4">
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between items-center text-zinc-400">
                            <span>Your Role:</span>
                            <Badge tone="neutral">{user.role}</Badge>
                        </div>
                        <Link href={fallbackUrl}>
                            <Button variant="primary" className="w-full text-xs">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
