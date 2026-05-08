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

    set<T>(key: string, value: T, fallback: T, _codec: Codec<T>): void {
        if (Object.is(value, fallback)) {
            if (key in this.record) {
                delete this.record[key];
                this.notify();
            }
            return;
        }
        if (!Object.is(this.record[key], value)) {
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
