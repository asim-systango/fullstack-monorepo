import { toast, type ToastOptions } from 'react-toastify';

const defaults: ToastOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/** Safe user-facing message for any unexpected API / network failure. */
export const GENERIC_ERROR_MESSAGE = 'Something went wrong';

export function toastSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, { ...defaults, ...options });
}

export function toastError(message: string, options?: ToastOptions) {
  return toast.error(message, { ...defaults, ...options });
}

export function toastInfo(message: string, options?: ToastOptions) {
  return toast.info(message, { ...defaults, ...options });
}

/**
 * Toast for failed API / network calls.
 * Never surfaces backend or exception text to the user.
 */
export function toastApiError(_err?: unknown, options?: ToastOptions) {
  return toastError(GENERIC_ERROR_MESSAGE, options);
}

/**
 * Always returns a safe fallback — never leaks API/exception messages.
 * Prefer `toastApiError` for catch blocks.
 */
export function getErrorMessage(_err: unknown, fallback = GENERIC_ERROR_MESSAGE) {
  return fallback;
}
