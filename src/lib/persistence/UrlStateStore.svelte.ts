import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import type { Codec, StateStore } from './StateStore.js';

const browser = typeof window !== 'undefined';

/**
 * Persists state to URL search params via SvelteKit's `replaceState`.
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
    /**
     * Reactive mirror of the committed (already-flushed) URL search params.
     * Seeded from the URL at construction and rewritten from the URL we build
     * on every flush.
     *
     * A fall-through read (key not in `pendingWrites`) cannot depend on
     * `window.location` (not reactive) or `page.url` (never updated by
     * `replaceState` — shallow routing pins it to the last real navigation).
     * Without a reactive source, once `pendingWrites` clears a getter latches
     * whatever it last read and never re-runs — e.g. the pagination highlight
     * stays on the previous page while the fetched rows move on. Tracking our
     * own copy keeps these reads reactive, and rebuilding it from the `url` we
     * just wrote makes it correct regardless of when `window.location` /
     * `page.url` observe the change.
     */
    private committed: Record<string, string> = $state.raw(snapshotParams(currentUrl()));
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
        const raw = this.committed[scoped];
        if (raw === undefined) return fallback;
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
        const url = currentUrl();
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
        if (changed) replaceState(url, page.state);
        // Refresh the reactive mirror from the URL we just built. This is
        // deterministic (it does not depend on when `window.location` or
        // `page.url` observe the `replaceState`) and, being `$state`, wakes
        // every fall-through reader so highlights/labels stay in sync with the
        // page that was just committed.
        this.committed = snapshotParams(url);
        this.pendingWrites = {};
    }
}

/**
 * Snapshot of a URL's search params as a plain record, for the reactive
 * committed-params mirror.
 */
function snapshotParams(url: URL): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of url.searchParams) {
        params[key] = value;
    }
    return params;
}

/**
 * Source of truth for URL reads at construction and the base URL for writes.
 *
 * `$app/navigation.replaceState` updates `window.location` and `page.state`,
 * but NOT `page.url` — it's a shallow-routing API that intentionally keeps
 * `page.url` pinned to the last real navigation. So we read `window.location`
 * in the browser (freshest source, incl. edits from a prior flush) and fall
 * back to `page.url` only for SSR. Reactive reads go through the `committed`
 * mirror instead; this is used for the initial seed and as the write base.
 */
function currentUrl(): URL {
    return browser ? new URL(window.location.href) : new URL(page.url);
}
