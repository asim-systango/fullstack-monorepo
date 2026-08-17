import { useAuth } from '@/components/auth';
import { getUserRole, canManage, canAdmin } from '@/lib/auth/permissions';

export function useUserRole() {
    const { user } = useAuth();
    const role = getUserRole(user);
    return {
        userRole: role,
        canManage: canManage(role),
        canAdmin: canAdmin(role),
    };
}
