import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
import { MemoryStateStore } from './MemoryStateStore.svelte.js';
import { SnapshotStateStore } from './SnapshotStateStore.svelte.js';
import type { StateStore } from './StateStore.js';
import { UrlStateStore } from './UrlStateStore.svelte.js';
import { WebStorageStateStore } from './WebStorageStateStore.svelte.js';

/**
 * Persistence options on `DataTableConfig`. Two independent backends — one for
 * short-lived transient state (page/search/sort/open), one for longer-lived UI
 * preferences (column widths/visibility/density when those features land).
 *
 * Defaults preserve current behavior: `transient` is `'snapshot'` so the
 * existing `capture()`/`restore()` wiring keeps working, and `persistent` is
 * `'none'` so we never touch `localStorage` without explicit opt-in.
 */
export interface PersistenceOptions {
    /**
     * URL search-param prefix used when `transient: 'url'`. URL keys take the
     * form `${urlPrefix}-${field}` (e.g. `dt-page`, `dt-q`). Override when
     * multiple tables share a route, otherwise their params collide.
     *
     * @default 'dt'
     */
    urlPrefix?: string;

    /**
     * Storage namespace used when `persistent: 'localStorage' | 'sessionStorage'`.
     * Storage keys take the form `${storageNamespace}-${field}`. Defaults to
     * `config.type`, which is required to be unique across the consumer's app
     * already, so collisions across pages of the same app are avoided.
     *
     * @default config.type
     */
    storageNamespace?: string;

    /**
     * Backend for short-lived per-view state (page, search, sort, open index).
     *
     * - `'snapshot'` — backed by the in-memory record exposed via
     *   `capture()`/`restore()` for SvelteKit's `Snapshot` API. Preserves
     *   pre-existing behavior.
     * - `'url'` — backed by URL search params via `replaceState`. Shareable,
     *   refresh-survivable, back/forward-aware.
     * - `'none'` — state lives only in component memory; lost on navigation.
     *
     * @default 'snapshot'
     */
    transient?: 'snapshot' | 'url' | 'none';

    /**
     * Backend for longer-lived UI preferences (column widths/visibility/order/density).
     *
     * @default 'none'
     */
    persistent?: 'localStorage' | 'sessionStorage' | 'none';

    /**
     * Override the URL-write debounce window (ms). The store buffers writes so
     * a burst of state changes (e.g. fast typing) results in one
     * `replaceState` call.
     *
     * @default 300
     */
    urlDebounceMs?: number;
}

export interface CreatedStores {
    transient: StateStore;
    persistent: StateStore;
    snapshot: SnapshotStateStore | undefined;
    /** Cleanup hook; call from `onDestroy`. */
    destroy: () => void;
}

/**
 * Resolve a `DataTableConfig`'s `persistence` option into the concrete store
 * pair the persistence layer needs. The `snapshot` store (when used) is also
 * returned separately so the component can wire `capture()` / `restore()`
 * directly to its in-memory record.
 */
export function createStores(config: DataTableConfig<unknown>): CreatedStores {
    const opts: PersistenceOptions = config.persistence ?? {};
    const transientKind = opts.transient ?? 'snapshot';
    const persistentKind = opts.persistent ?? 'none';
    const urlPrefix = opts.urlPrefix ?? 'dt';
    const storageNamespace = opts.storageNamespace ?? config.type;
    const urlDebounceMs = opts.urlDebounceMs ?? 300;

    let snapshot: SnapshotStateStore | undefined;
    let urlStore: UrlStateStore | undefined;
    let webStorageStore: WebStorageStateStore | undefined;

    let transient: StateStore;
    if (transientKind === 'snapshot') {
        snapshot = new SnapshotStateStore();
        transient = snapshot;
    } else if (transientKind === 'url') {
        urlStore = new UrlStateStore(urlPrefix, urlDebounceMs);
        transient = urlStore;
    } else {
        // 'none' still needs to hold values during the component's lifetime
        // so pagination/search/sort continue to function — they just don't
        // survive navigation. Anything else would break the table.
        transient = new MemoryStateStore();
    }

    let persistent: StateStore;
    if (persistentKind === 'localStorage' || persistentKind === 'sessionStorage') {
        webStorageStore = new WebStorageStateStore(persistentKind, storageNamespace);
        persistent = webStorageStore;
    } else {
        // Same reasoning: 'none' must keep the user's items-per-page /
        // column-visibility / column-width choices working during the view.
        persistent = new MemoryStateStore();
    }

    return {
        transient,
        persistent,
        snapshot,
        destroy() {
            urlStore?.destroy();
            webStorageStore?.destroy();
        }
    };
}
