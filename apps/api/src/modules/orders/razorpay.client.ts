import { request as httpsRequest } from 'https';
import { razorpayConfig } from '../../config/razorpay.config';

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

type RazorpayErrorBody = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
};

export class RazorpayApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'RazorpayApiError';
  }
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  const { keyId, keySecret, tlsInsecure } = razorpayConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        hostname: 'api.razorpay.com',
        path,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        rejectUnauthorized: !tlsInsecure,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: T | RazorpayErrorBody = {};
          try {
            parsed = JSON.parse(data) as T | RazorpayErrorBody;
          } catch {
            reject(
              new RazorpayApiError(
                `Unexpected Razorpay response (${res.statusCode ?? 'unknown'})`,
                res.statusCode,
              ),
            );
            return;
          }

          if ((res.statusCode ?? 500) >= 400) {
            const errBody = parsed as RazorpayErrorBody;
            reject(
              new RazorpayApiError(
                errBody.error?.description ??
                  errBody.error?.reason ??
                  'Razorpay request failed',
                res.statusCode,
              ),
            );
            return;
          }

          resolve(parsed as T);
        });
      },
    );

    req.on('error', (err) => {
      const message =
        err.message.includes('SELF_SIGNED_CERT') ||
        err.message.includes('certificate')
          ? 'Could not reach Razorpay (TLS/certificate issue). For local dev behind a corporate proxy, set RAZORPAY_TLS_INSECURE=true in apps/api/.env.'
          : `Could not reach Razorpay: ${err.message}`;
      reject(new RazorpayApiError(message));
    });

    req.setTimeout(15_000, () => {
      req.destroy(new RazorpayApiError('Razorpay request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

export function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return postJson<RazorpayOrder>('/v1/orders', input);
}
