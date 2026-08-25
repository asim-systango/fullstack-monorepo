import { mockFoodApi } from '@/lib/mock/handlers';
import { foodApiClient, isMockFoodApiEnabled } from '@/lib/api/food-delivery';
import { withApiLoading } from '@/lib/api-loading';

export const foodApi = isMockFoodApiEnabled()
  ? withApiLoading(mockFoodApi)
  : foodApiClient;

export { isMockFoodApiEnabled };
