import { onDestroy, onMount } from 'svelte';
import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
import type { CreatedStores, PersistenceOptions } from './createStores.svelte.js';

/**
 * Module-scoped registry of `${namespace}::${tier}` keys currently mounted on
 * the page. When two table instances share a tier+namespace, their URL params
 * or storage keys collide silently. We log a `console.warn` on collision so
 * the consumer notices and sets an explicit `persistence.namespace`.
 */
const activeKeys = new Set<string>();

export function registerNamespaceCollisions(config: DataTableConfig<unknown>, stores: CreatedStores): void {
    const opts: PersistenceOptions = config.persistence ?? {};
    const transientKind = opts.transient ?? 'snapshot';
    const persistentKind = opts.persistent ?? 'none';
    const urlPrefix = opts.urlPrefix ?? 'dt';
    const storageNamespace = opts.storageNamespace ?? config.type;

    const claimed: string[] = [];

    onMount(() => {
        if (transientKind === 'url') {
            claim(`${urlPrefix}::url`, `URL prefix '${urlPrefix}'`, claimed);
        }
        if (persistentKind === 'localStorage' || persistentKind === 'sessionStorage') {
            claim(`${storageNamespace}::${persistentKind}`, `${persistentKind} namespace '${storageNamespace}'`, claimed);
        }
    });

    onDestroy(() => {
        for (const key of claimed) activeKeys.delete(key);
        stores.destroy();
    });
}

function claim(key: string, label: string, claimed: string[]): void {
    if (activeKeys.has(key)) {
        console.warn(
            `svelte-advanced-datatable: ${label} is in use by another DataTable on this page. ` +
                `Set persistence.urlPrefix or persistence.storageNamespace to a unique value to avoid colliding state.`
        );
        return;
    }
    activeKeys.add(key);
    claimed.push(key);
}
