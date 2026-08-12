import { loadApiEnv } from '@shared/env/api';

export function razorpayConfig() {
  const env = loadApiEnv();
  const keyId = env.RAZORPAY_KEY_ID?.trim() ?? '';
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim() ?? '';
  const enabled = Boolean(keyId && keySecret);

  return { keyId, keySecret, enabled, tlsInsecure: env.RAZORPAY_TLS_INSECURE };
}
