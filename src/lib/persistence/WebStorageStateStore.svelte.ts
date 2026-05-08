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
    /** Reactive version counter — bumped on every successful set (same tab)
     * and on cross-tab `storage` events. `get` touches it before reading
     * from `localStorage`, so any reactive reader (a `box.with` getter
     * inside an `$effect` or `$derived`) re-runs when storage changes. */
    private version = $state(0);

    constructor(
        private readonly kind: WebStorageKind,
        private readonly namespace: string
    ) {
        if (browser && this.kind === 'localStorage') {
            window.addEventListener('storage', this.handleStorageEvent);
        }
    }

    get<T>(key: string, fallback: T, codec: Codec<T>): T {
        // Reactive read: ties this getter to writes on the same store.
        void this.version;
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
            const eq = codec.isEqual ?? Object.is;
            const previous = storage.getItem(scopedKey);
            if (eq(value, fallback)) {
                if (previous !== null) {
                    storage.removeItem(scopedKey);
                    this.version++;
                }
            } else {
                const next = codec.encode(value);
                if (previous !== next) {
                    storage.setItem(scopedKey, next);
                    this.version++;
                }
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
        this.version++;
        for (const cb of this.listeners) cb();
    };
}
