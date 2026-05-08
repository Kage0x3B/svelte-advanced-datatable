import type { Codec, StateStore } from './StateStore.js';

/**
 * In-memory store that backs the SvelteKit `Snapshot` bridge.
 *
 * The DaisyUiDataTable component's `capture()` / `restore()` methods read and
 * write through this store, so consumers continue wiring SvelteKit's snapshot
 * export the same way they always have. Values are stored raw (no codec
 * marshaling) so `capture()` returns the typed `DataTableState` shape.
 */
export class SnapshotStateStore implements StateStore {
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

    /** Read the entire backing record. Used by `capture()`. */
    snapshot(): Record<string, unknown> {
        return { ...this.record };
    }

    /** Replace the backing record. Used by `restore()`. */
    hydrate(values: Record<string, unknown>): void {
        this.record = { ...values };
        this.notify();
    }

    private notify(): void {
        for (const cb of this.listeners) cb();
    }
}
