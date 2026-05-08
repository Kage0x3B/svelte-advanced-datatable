<script module lang="ts">
    let consoleWarn: typeof console.warn | undefined = undefined;

    if (!consoleWarn && false) {
        console.log('overwriting console.warn');
        consoleWarn = console.warn.bind(console);
        console.warn = (...args) => {
            if (
                args.length >= 1 &&
                typeof args[0] === 'string' &&
                args[0].includes('ownership_invalid_mutation') &&
                (args[0].includes('QueryClientProvider') || args[0].includes('InternalDataTable'))
            ) {
                return;
            }

            consoleWarn?.(...args);
        };
    }
</script>

<script lang="ts">
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { QueryResult } from '$lib/dataSource/QueryResult.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import type { SortDirection } from '$lib/types/SortDirection.js';
    import { configContext, dataSourceContext } from '$lib/util/context.js';
    import { buildColumnPropertyData } from '$lib/util/dataTableUtil.js';
    import type { Snippet } from 'svelte';

    const config = $derived(configContext.get().current);
    const forcedSearchQuery = $derived(config.forcedSearchQuery);
    const dataSource = $derived(dataSourceContext.get().current);

    export interface Props {
        state: InternalDataTableState;
        searchQuery: ParsedSearchQuery | undefined;
        /**
         * Externally-incremented counter that forces the `refresh()` effect
         * to re-run. Used by the row-action / bulk-action runner to trigger
         * a re-fetch after a mutation, without polluting the persisted
         * state shape with synthetic fields.
         */
        refreshNonce?: number;
        children: Snippet<
            [
                {
                    queryResult: QueryResult<unknown>;
                    columnProperties: Record<string, ComponentTypeProperties>;
                    itemAmount: number;
                    pageAmount: number;
                    items: Record<string, unknown>[];
                    toggleSorting: (columnKey: string, additive: boolean) => void;
                    open: (index: number) => void;
                    highlightedItemId: string | undefined;
                }
            ]
        >;
    }

    let { state, searchQuery, refreshNonce = 0, children }: Props = $props();

    dataSource.setConfig?.(config);
    $effect(() => dataSource.setConfig?.(config));
    $effect(() => dataSource.onMount?.());

    const queryResult = $derived(dataSource.queryResult);
    const queryData = $derived(queryResult.data);
    const itemAmount = $derived.by(() => {
        if (!queryData?.items) {
            return -1;
        }

        const calculatedMaxItemAmount = ((state.currentPage ?? 1) - 1) * state.itemsPerPage + queryData.items.length;

        return calculatedMaxItemAmount >= state.itemsPerPage
            ? queryData.totalCount
            : Math.min(queryData.totalCount, calculatedMaxItemAmount);
    });

    const pageAmount = $derived(Math.ceil(Math.max(1, itemAmount / state.itemsPerPage)));
    const items: Record<string, unknown>[] = $derived((queryData?.items ?? []) as Record<string, unknown>[]);

    const highlightedItemId = $derived(config.highlightedItemId);

    $effect(() => {
        if (config.autoOpenSingleItem && items.length === 1 && state.currentOpenIndex === undefined) {
            state.currentOpenIndex = 0;
        }
    });

    const internalColumnProperties = $derived(buildColumnPropertyData(config.columnProperties));

    function refresh() {
        // Read the nonce so externally bumping it forces the surrounding
        // `$effect(() => refresh())` to re-run. Mutations triggered by row
        // / bulk actions use this path to re-fetch the current view.
        void refreshNonce;

        let orderBy: PaginatedListRequest<unknown>['orderBy'] | undefined;

        if (state.sortColumnKey && state.sortDirection) {
            orderBy = {
                column: state.sortColumnKey,
                order: state.sortDirection
            };
        }

        const additionalOrderBy: PaginatedListRequest<unknown>['additionalOrderBy'] =
            // Tiebreakers only apply when there's a primary orderBy and the
            // forced search query hasn't taken sort over entirely.
            !forcedSearchQuery?.orderBy && orderBy && state.additionalSort.length > 0
                ? state.additionalSort.map((s) => ({ column: s.column, order: s.direction }))
                : undefined;

        const searchFilters = [
            ...(searchQuery?.searchFilters ?? []),
            ...(forcedSearchQuery?.searchQuery?.searchFilters ?? [])
        ];

        const requestData: PaginatedListRequest<unknown> = {
            start: (state.currentPage - 1) * state.itemsPerPage,
            amount: state.itemsPerPage,
            orderBy: forcedSearchQuery?.orderBy ?? orderBy,
            additionalOrderBy,
            searchQuery: {
                searchCategories:
                    forcedSearchQuery?.searchQuery?.searchCategories ?? searchQuery?.searchCategories ?? [],
                searchFilters,
                searchText: forcedSearchQuery?.searchQuery?.searchText ?? searchQuery?.searchText ?? '',
                forceGlobalSearch:
                    forcedSearchQuery?.searchQuery?.forceGlobalSearch ?? searchQuery?.forceGlobalSearch ?? false
            }
        };

        dataSource.requestData(requestData);
    }

    $effect(() => refresh());

    let lastReportedError: Error | undefined = undefined;
    $effect(() => {
        if (queryResult.isError() && queryResult.error !== lastReportedError) {
            lastReportedError = queryResult.error;
            config.onError?.(queryResult.error);
        }
    });

    /**
     * Toggle sorting on a column. When `additive` is false (regular click)
     * the existing single-sort cycle runs (asc → desc → off → asc) and any
     * Shift-built tiebreakers are cleared. When `additive` is true
     * (Shift-click): if no primary sort is set yet, this column becomes the
     * primary; if the column is already the primary, its direction cycles;
     * if the column is already a tiebreaker, that entry's direction cycles
     * (asc → desc → removed); otherwise the column appends as a new
     * tiebreaker with `desc`.
     */
    function toggleSorting(columnKey: string, additive: boolean = false): void {
        if (!items.length || items.length <= 1) {
            return;
        }

        if (!additive) {
            if (state.sortColumnKey === columnKey) {
                state.sortDirection =
                    state.sortDirection === 'desc' ? 'asc' : state.sortDirection === 'asc' ? false : 'desc';
            } else {
                state.sortColumnKey = columnKey;
                state.sortDirection = 'desc';
            }
            if (state.additionalSort.length > 0) {
                state.additionalSort = [];
            }
            return;
        }

        // Shift-click flow.
        if (!state.sortColumnKey || !state.sortDirection) {
            state.sortColumnKey = columnKey;
            state.sortDirection = 'desc';
            return;
        }

        if (state.sortColumnKey === columnKey) {
            state.sortDirection =
                state.sortDirection === 'desc' ? 'asc' : state.sortDirection === 'asc' ? false : 'desc';
            if (!state.sortDirection && state.additionalSort.length > 0) {
                // Promote the first tiebreaker to primary so the user
                // doesn't lose the rest of their multi-sort by cycling the
                // primary off.
                const [next, ...rest] = state.additionalSort;
                state.sortColumnKey = next.column;
                state.sortDirection = next.direction;
                state.additionalSort = rest;
            }
            return;
        }

        const existingIndex = state.additionalSort.findIndex((entry) => entry.column === columnKey);
        if (existingIndex >= 0) {
            const existing = state.additionalSort[existingIndex];
            const next = [...state.additionalSort];
            if (existing.direction === 'desc') {
                next[existingIndex] = { column: columnKey, direction: 'asc' };
            } else {
                next.splice(existingIndex, 1);
            }
            state.additionalSort = next;
        } else {
            state.additionalSort = [...state.additionalSort, { column: columnKey, direction: 'desc' }];
        }
    }

    const open = (index: number) => {
        state.currentOpenIndex = items.length <= 1 ? 0 : index;
    };
</script>

{@render children({
    queryResult,
    columnProperties: internalColumnProperties,
    itemAmount,
    pageAmount,
    items,
    toggleSorting,
    open,
    highlightedItemId
})}
