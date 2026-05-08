import type { Codec, StateStore } from './StateStore.js';

/**
 * In-memory store that holds values in `$state` for the lifetime of the
 * component, but never serializes them anywhere.
 *
 * Used when a tier is configured as `'none'` — the user has opted out of any
 * external persistence (URL / localStorage / etc.) but the table still needs
 * a working state container so pagination, search, sort and the settings
 * popover continue to function during the current view. Values are lost on
 * navigation away.
 */
export class MemoryStateStore implements StateStore {
    private record: Record<string, unknown> = $state({});
    private listeners = new Set<() => void>();

    get<T>(key: string, fallback: T, _codec: Codec<T>): T {
        const stored = this.record[key];
        return stored === undefined ? fallback : (stored as T);
    }

    set<T>(key: string, value: T, fallback: T, codec: Codec<T>): void {
        const eq = codec.isEqual ?? Object.is;
        if (eq(value, fallback)) {
            if (key in this.record) {
                delete this.record[key];
                this.notify();
            }
            return;
        }
        // Skip the change check on a fresh slot — `record[key]` is `undefined`
        // there, and an object-codec's `isEqual` would crash on it.
        const stored = this.record[key];
        if (stored === undefined || !eq(stored as T, value)) {
            this.record[key] = value;
            this.notify();
        }
    }

    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notify(): void {
        for (const cb of this.listeners) cb();
    }
}
