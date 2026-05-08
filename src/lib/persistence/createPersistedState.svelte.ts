import type { DataTableState, InternalDataTableState } from '$lib/types/DataTableState.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import { box } from 'svelte-toolbelt';
import {
    additionalSortCodec,
    densityCodec,
    jsonRecordCodec,
    jsonStringArrayCodec,
    numberCodec,
    optionalNumberCodec,
    optionalStringCodec,
    sortDirectionCodec,
    stringCodec
} from './codecs.js';
import { FIELD_KEY } from './fieldTiers.js';
import type { StateStore } from './StateStore.js';

export interface PersistenceStores {
    transient: StateStore;
    persistent: StateStore;
}

/**
 * Builds the `InternalDataTableState` shape from a transient + persistent
 * store pair. Each field becomes a `box.with(getter, setter)` whose getter
 * reactively reads from its tier's store and whose setter writes back. The
 * downstream `box.flatten` produces the same flat record shape the rest of
 * the component already expects.
 *
 * `initialState` (when provided by the consumer) is folded into each field's
 * fallback so that pre-existing snapshot wiring and URL/storage values both
 * keep working.
 */
export function createPersistedState(
    config: FullDataTableConfig<unknown>,
    initialState: DataTableState | undefined,
    stores: PersistenceStores
): InternalDataTableState {
    const { transient, persistent } = stores;

    const fallbackPage = initialState?.currentPage ?? 1;
    const fallbackSearch = initialState?.searchInput ?? '';
    const fallbackOpen = initialState?.currentOpenIndex;
    const fallbackSortCol = initialState?.sortColumnKey ?? config.defaultSort?.columnKey;
    const fallbackSortDir = initialState?.sortDirection ?? config.defaultSort?.direction ?? false;
    const fallbackAdditionalSort: Array<{ column: string; direction: 'asc' | 'desc' }> =
        initialState?.additionalSort ?? [];
    const fallbackItemsPerPage = initialState?.itemsPerPage ?? config.itemsPerPage;
    const fallbackColumnVisibility: Record<string, boolean> = initialState?.columnVisibility ?? {};
    const fallbackColumnWidths: Record<string, number> = initialState?.columnWidths ?? {};
    const fallbackColumnOrder: string[] = initialState?.columnOrder ?? [];
    const fallbackDensity: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined = initialState?.density;

    const visibilityCodec = jsonRecordCodec<boolean>();
    const widthsCodec = jsonRecordCodec<number>();
    const orderCodec = jsonStringArrayCodec();
    const sortTailCodec = additionalSortCodec();

    // Init-time normalization: read each field, then immediately echo the
    // value back to the store. Values equal to their fallback get scrubbed
    // (default-elision), so deep-links like `?dt-page=1&dt-q=Alice` lose the
    // redundant `dt-page=1`. Non-default values round-trip without effect.
    const initialPage = transient.get(FIELD_KEY.currentPage, fallbackPage, numberCodec);
    const initialSearch = transient.get(FIELD_KEY.searchInput, fallbackSearch, stringCodec);
    const initialOpen = transient.get(FIELD_KEY.currentOpenIndex, fallbackOpen, optionalNumberCodec);
    const initialSortCol = transient.get(FIELD_KEY.sortColumnKey, fallbackSortCol, optionalStringCodec);
    const initialSortDir = transient.get(FIELD_KEY.sortDirection, fallbackSortDir, sortDirectionCodec);
    const initialAdditionalSort = transient.get(FIELD_KEY.additionalSort, fallbackAdditionalSort, sortTailCodec);
    transient.set(FIELD_KEY.currentPage, initialPage, fallbackPage, numberCodec);
    transient.set(FIELD_KEY.searchInput, initialSearch, fallbackSearch, stringCodec);
    transient.set(FIELD_KEY.currentOpenIndex, initialOpen, fallbackOpen, optionalNumberCodec);
    transient.set(FIELD_KEY.sortColumnKey, initialSortCol, fallbackSortCol, optionalStringCodec);
    transient.set(FIELD_KEY.sortDirection, initialSortDir, fallbackSortDir, sortDirectionCodec);
    transient.set(FIELD_KEY.additionalSort, initialAdditionalSort, fallbackAdditionalSort, sortTailCodec);

    return box.flatten({
        currentPage: box.with(
            () => transient.get(FIELD_KEY.currentPage, fallbackPage, numberCodec),
            (v) => transient.set(FIELD_KEY.currentPage, v, fallbackPage, numberCodec)
        ),
        searchInput: box.with(
            () => transient.get(FIELD_KEY.searchInput, fallbackSearch, stringCodec),
            (v) => transient.set(FIELD_KEY.searchInput, v, fallbackSearch, stringCodec)
        ),
        currentOpenIndex: box.with(
            () => transient.get(FIELD_KEY.currentOpenIndex, fallbackOpen, optionalNumberCodec),
            (v) => transient.set(FIELD_KEY.currentOpenIndex, v, fallbackOpen, optionalNumberCodec)
        ),
        sortColumnKey: box.with(
            () => transient.get(FIELD_KEY.sortColumnKey, fallbackSortCol, optionalStringCodec),
            (v) => transient.set(FIELD_KEY.sortColumnKey, v, fallbackSortCol, optionalStringCodec)
        ),
        sortDirection: box.with(
            () => transient.get(FIELD_KEY.sortDirection, fallbackSortDir, sortDirectionCodec),
            (v) => transient.set(FIELD_KEY.sortDirection, v, fallbackSortDir, sortDirectionCodec)
        ),
        additionalSort: box.with(
            () => transient.get(FIELD_KEY.additionalSort, fallbackAdditionalSort, sortTailCodec),
            (v) => transient.set(FIELD_KEY.additionalSort, v, fallbackAdditionalSort, sortTailCodec)
        ),
        itemsPerPage: box.with(
            () => persistent.get(FIELD_KEY.itemsPerPage, fallbackItemsPerPage, numberCodec),
            (v) => persistent.set(FIELD_KEY.itemsPerPage, v, fallbackItemsPerPage, numberCodec)
        ),
        columnVisibility: box.with(
            () => persistent.get(FIELD_KEY.columnVisibility, fallbackColumnVisibility, visibilityCodec),
            (v) => persistent.set(FIELD_KEY.columnVisibility, v, fallbackColumnVisibility, visibilityCodec)
        ),
        columnWidths: box.with(
            () => persistent.get(FIELD_KEY.columnWidths, fallbackColumnWidths, widthsCodec),
            (v) => persistent.set(FIELD_KEY.columnWidths, v, fallbackColumnWidths, widthsCodec)
        ),
        columnOrder: box.with(
            () => persistent.get(FIELD_KEY.columnOrder, fallbackColumnOrder, orderCodec),
            (v) => persistent.set(FIELD_KEY.columnOrder, v, fallbackColumnOrder, orderCodec)
        ),
        density: box.with(
            () => persistent.get(FIELD_KEY.density, fallbackDensity, densityCodec),
            (v) => persistent.set(FIELD_KEY.density, v, fallbackDensity, densityCodec)
        )
    });
}
