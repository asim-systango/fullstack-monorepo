import { loadApiEnv } from '@shared/env/api';

export function cloudinaryConfig() {
  const env = loadApiEnv();
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase() ?? '';
  const apiKey = env.CLOUDINARY_API_KEY?.trim() ?? '';
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim() ?? '';
  const enabled = Boolean(cloudName && apiKey && apiSecret);

  return { cloudName, apiKey, apiSecret, enabled };
}
