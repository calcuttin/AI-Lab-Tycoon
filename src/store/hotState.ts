import type { StateCreator, StoreApi } from 'zustand/vanilla';

/** In-memory HMR snapshots preserve Dates without carrying stale action closures. */
export type HotStateSnapshot = Record<string, unknown>;

function cloneData(value: unknown): unknown {
  if (value instanceof Date) return new Date(value.getTime());
  if (Array.isArray(value)) return value.map(cloneData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([, field]) => typeof field !== 'function')
      .map(([key, field]) => [key, cloneData(field)]));
  }
  return typeof value === 'function' ? undefined : value;
}

export function captureHotState<T extends object>(state: T): HotStateSnapshot {
  return cloneData(state) as HotStateSnapshot;
}

/** Retain new defaults and freshly-created actions, restoring known data keys only. */
export function restoreHotState<T extends object>(freshState: T, snapshot: HotStateSnapshot): T {
  return Object.fromEntries(Object.entries(freshState).map(([key, fresh]) => [
    key,
    typeof fresh !== 'function' && Object.hasOwn(snapshot, key) && typeof snapshot[key] !== 'function'
      ? cloneData(snapshot[key])
      : fresh,
  ])) as T;
}


/** Refresh code against the SAME API, retaining all existing hook subscriptions. */
export function refreshHotStore<T extends object>(
  store: StoreApi<T>,
  createState: StateCreator<T>,
  snapshot = captureHotState(store.getState()),
): void {
  const freshState = createState(store.setState, store.getState, store);
  store.setState(restoreHotState(freshState, snapshot), true);
}
