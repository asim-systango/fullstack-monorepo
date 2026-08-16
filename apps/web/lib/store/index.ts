export { useUiStore } from './ui-store';
export { useLibraryStore } from './library-store';
export { useAuthUiStore } from './auth-ui-store';

import { useAuthUiStore } from './auth-ui-store';
import { useLibraryStore } from './library-store';
import { useUiStore } from './ui-store';

/** Clear all client/workflow stores (e.g. on logout). */
export function resetClientStores(): void {
  useUiStore.getState().reset();
  useLibraryStore.getState().reset();
  useAuthUiStore.getState().reset();
}
