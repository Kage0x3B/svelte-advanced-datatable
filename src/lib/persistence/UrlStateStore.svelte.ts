import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import type { Codec, StateStore } from './StateStore.js';

const browser = typeof window !== 'undefined';

/**
 * Persists state to URL search params via SvelteKit's `replaceState`.
 *
 * Reads are synchronous and reactive — they touch `page.url`, so any read
 * inside an `$effect` / `$derived` re-runs when the URL changes (back/forward
 * navigation, replaceState).
 *
 * Writes are buffered: each `set` updates a reactive pending-changes record
 * (so subsequent `get` calls see the latest value immediately), then schedules
 * a debounced flush that calls `replaceState` once. This avoids history spam
 * while keeping the UI in sync with what the user just typed/clicked.
 *
 * SSR-safe: `set` is a no-op outside the browser. `get` works during SSR
 * because `page.url` is populated server-side.
 */
export class UrlStateStore implements StateStore {
    private pendingWrites: Record<string, string | null> = $state({});
    private debounceTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly prefix: string,
        private readonly debounceMs: number = 300
    ) {}

    get<T>(key: string, fallback: T, codec: Codec<T>): T {
        const scoped = this.scoped(key);
        if (scoped in this.pendingWrites) {
            const pending = this.pendingWrites[scoped];
            if (pending === null) return fallback;
            try {
                return codec.decode(pending);
            } catch {
                return fallback;
            }
        }
        const raw = page.url.searchParams.get(scoped);
        if (raw === null) return fallback;
        try {
            return codec.decode(raw);
        } catch {
            return fallback;
        }
    }

    set<T>(key: string, value: T, fallback: T, codec: Codec<T>): void {
        if (!browser) return;
        const scoped = this.scoped(key);
        const eq = codec.isEqual ?? Object.is;
        if (eq(value, fallback)) {
            this.pendingWrites[scoped] = null;
        } else {
            this.pendingWrites[scoped] = codec.encode(value);
        }
        this.scheduleFlush();
    }

    /** Cleanup hook for component teardown. */
    destroy(): void {
        if (this.debounceTimer !== undefined) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = undefined;
        }
        this.flush();
    }

    private scoped(key: string): string {
        return `${this.prefix}-${key}`;
    }

    private scheduleFlush(): void {
        if (this.debounceTimer !== undefined) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.flush();
            this.debounceTimer = undefined;
        }, this.debounceMs);
    }

    private flush(): void {
        const entries = Object.entries(this.pendingWrites);
        if (entries.length === 0) return;
        const url = new URL(page.url);
        let changed = false;
        for (const [key, value] of entries) {
            if (value === null) {
                if (url.searchParams.has(key)) {
                    url.searchParams.delete(key);
                    changed = true;
                }
            } else if (url.searchParams.get(key) !== value) {
                url.searchParams.set(key, value);
                changed = true;
            }
        }
        this.pendingWrites = {};
        if (changed) replaceState(url, page.state);
    }
}
