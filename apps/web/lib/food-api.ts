import { mockFoodApi } from '@/lib/mock/handlers';
import { foodApiClient, isMockFoodApiEnabled } from '@/lib/api/food-delivery';
import { withApiLoading } from '@/lib/api-loading';

/**
 * One place for all food-delivery API calls.
 *
 * - NEXT_PUBLIC_USE_MOCK=true  → fake data in the browser (no backend needed)
 * - NEXT_PUBLIC_USE_MOCK=false → real Nest backend via gateway proxy (/api → :3001 → :3002)
 *
 * Pages and hooks always import `foodApi` from here.
 *
 * Mock mode wraps calls for the global loading overlay. Real mode is tracked
 * via axios interceptors on `apiClient` (so we do not double-count).
 */
export const foodApi = isMockFoodApiEnabled()
  ? withApiLoading(mockFoodApi)
  : foodApiClient;

export { isMockFoodApiEnabled };
