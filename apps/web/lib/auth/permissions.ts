import type { UserProfile } from '@/lib/api/types/auth.types';
import { UserRole } from './roles';

export function getUserRole(user: UserProfile | null): string {
    if (!user) return '';
    if (typeof user.role === 'object' && user.role !== null) {
        return (user.role as { name?: string }).name ?? '';
    }
    return (user.role as string) ?? '';
}

export function canManage(role: string): boolean {
    return (
        role === UserRole.ORG_ADMIN ||
        role === UserRole.SUPER_ADMIN ||
        role === UserRole.SALES_LEAD
    );
}

export function canAdmin(role: string): boolean {
    return role === UserRole.ORG_ADMIN || role === UserRole.SUPER_ADMIN;
}
