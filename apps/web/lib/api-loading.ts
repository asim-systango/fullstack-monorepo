type Listener = (pending: number) => void;

let pending = 0;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener(pending);
  }
}


export const apiLoading = {
  start() {
    pending += 1;
    notify();
  },
  stop() {
    pending = Math.max(0, pending - 1);
    notify();
  },
  getPending() {
    return pending;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(pending);
    return () => {
      listeners.delete(listener);
    };
  },
};

type AsyncFn = (...args: never[]) => Promise<unknown>;

const SILENT_API_KEYS = new Set([
  'getCart',
  'addToCart',
  'updateCartItem',
  'clearCart',
  'updateRestaurant',
  'listOrders',
  'getOrder',
]);

export function withApiLoading<T extends Record<string, unknown>>(api: T): T {
  const wrapped = { ...api };

  for (const key of Object.keys(api) as (keyof T)[]) {
    const value = api[key];
    if (typeof value !== 'function') continue;
    if (SILENT_API_KEYS.has(String(key))) continue;

    const fn = value as AsyncFn;
    (wrapped as Record<string, unknown>)[key as string] = async (...args: never[]) => {
      apiLoading.start();
      try {
        return await fn(...args);
      } finally {
        apiLoading.stop();
      }
    };
  }

  return wrapped;
}
