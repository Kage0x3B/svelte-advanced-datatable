import type { Codec, StateStore } from './StateStore.js';

export type WebStorageKind = 'localStorage' | 'sessionStorage';

const browser = typeof window !== 'undefined';

/**
 * Persists state to `localStorage` or `sessionStorage`.
 *
 * SSR-safe: during server rendering, `get` returns the fallback and `set` is a
 * no-op. On `localStorage` only, the store listens for the `storage` event so
 * changes from other tabs propagate.
 *
 * Values are stored as strings (codec-encoded) under `${namespace}-${key}`.
 */
export class WebStorageStateStore implements StateStore {
    private listeners = new Set<() => void>();

    constructor(
        private readonly kind: WebStorageKind,
        private readonly namespace: string
    ) {
        if (browser && this.kind === 'localStorage') {
            window.addEventListener('storage', this.handleStorageEvent);
        }
    }

    get<T>(key: string, fallback: T, codec: Codec<T>): T {
        if (!browser) return fallback;
        try {
            const raw = window[this.kind].getItem(this.scoped(key));
            if (raw === null) return fallback;
            return codec.decode(raw);
        } catch {
            return fallback;
        }
    }

    set<T>(key: string, value: T, fallback: T, codec: Codec<T>): void {
        if (!browser) return;
        try {
            const storage = window[this.kind];
            const scopedKey = this.scoped(key);
            if (Object.is(value, fallback)) {
                storage.removeItem(scopedKey);
            } else {
                storage.setItem(scopedKey, codec.encode(value));
            }
        } catch {
            // storage full / disabled — silently drop
        }
    }

    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /** Cleanup hook for component teardown. */
    destroy(): void {
        if (browser && this.kind === 'localStorage') {
            window.removeEventListener('storage', this.handleStorageEvent);
        }
        this.listeners.clear();
    }

    private scoped(key: string): string {
        return `${this.namespace}-${key}`;
    }

    private handleStorageEvent = (event: StorageEvent) => {
        if (event.storageArea !== window.localStorage) return;
        if (event.key !== null && !event.key.startsWith(`${this.namespace}-`)) return;
        for (const cb of this.listeners) cb();
    };
}
