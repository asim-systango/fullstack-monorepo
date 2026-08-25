import { toast, type ToastOptions } from 'react-toastify';

const defaults: ToastOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

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

export function toastApiError(_err?: unknown, options?: ToastOptions) {
  return toastError(GENERIC_ERROR_MESSAGE, options);
}

export function getErrorMessage(_err: unknown, fallback = GENERIC_ERROR_MESSAGE) {
  return fallback;
}
