import type { Codec, StateStore } from './StateStore.js';

/**
 * Pass-through store. Always returns `fallback` from `get`; `set` is a no-op.
 * Used when a tier's backend is configured as `'none'`.
 */
export class NoopStateStore implements StateStore {
    get<T>(_key: string, fallback: T, _codec: Codec<T>): T {
        return fallback;
    }

    set<T>(_key: string, _value: T, _fallback: T, _codec: Codec<T>): void {
        // intentionally empty
    }
}
