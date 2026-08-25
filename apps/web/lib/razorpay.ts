type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser'));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export type OpenRazorpayCheckoutParams = {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
};

export function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams,
): Promise<RazorpaySuccessResponse> {
  return loadRazorpayScript().then(
    () =>
      new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error('Razorpay checkout is unavailable'));
          return;
        }

        const rzp = new window.Razorpay({
          key: params.keyId,
          amount: params.amount,
          currency: params.currency,
          name: params.name ?? 'TastyGo',
          description: params.description ?? 'Food delivery order',
          order_id: params.razorpayOrderId,
          prefill: params.prefill,
          theme: { color: '#e23744' },
          handler: resolve,
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });

        rzp.on('payment.failed', (response) => {
          reject(new Error(response.error?.description ?? 'Payment failed'));
        });

        rzp.open();
      }),
  );
}
