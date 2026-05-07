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
        children: Snippet<
            [
                {
                    queryResult: QueryResult<unknown>;
                    columnProperties: Record<string, ComponentTypeProperties>;
                    itemAmount: number;
                    pageAmount: number;
                    items: Record<string, unknown>[];
                    toggleSorting: (columnKey: string) => void;
                    open: (index: number) => void;
                    highlightedItemId: string | undefined;
                }
            ]
        >;
    }

    let { state, searchQuery, children }: Props = $props();

    dataSource.setConfig?.(config);
    $effect(() => dataSource.setConfig?.(config));
    $effect(() => dataSource.onMount?.());

    const queryResult = $derived(dataSource.queryResult);
    const queryData = $derived(queryResult.data);
    const itemAmount = $derived.by(() => {
        if (!queryData?.items) {
            return -1;
        }

        const calculatedMaxItemAmount = ((state.currentPage ?? 1) - 1) * config.itemsPerPage + queryData.items.length;

        return calculatedMaxItemAmount >= config.itemsPerPage
            ? queryData.totalCount
            : Math.min(queryData.totalCount, calculatedMaxItemAmount);
    });

    const pageAmount = $derived(Math.ceil(Math.max(1, itemAmount / config.itemsPerPage)));
    const items: Record<string, unknown>[] = $derived((queryData?.items ?? []) as Record<string, unknown>[]);

    const highlightedItemId = $derived(config.highlightedItemId);

    $effect(() => {
        if (config.autoOpenSingleItem && items.length === 1 && state.currentOpenIndex === undefined) {
            state.currentOpenIndex = 0;
        }
    });

    const internalColumnProperties = $derived(buildColumnPropertyData(config.columnProperties));

    function refresh() {
        let orderBy: PaginatedListRequest<unknown>['orderBy'] | undefined;

        if (state.sortColumnKey && state.sortDirection) {
            orderBy = {
                column: state.sortColumnKey,
                order: state.sortDirection
            };
        }

        const searchFilters = [
            ...(searchQuery?.searchFilters ?? []),
            ...(forcedSearchQuery?.searchQuery?.searchFilters ?? [])
        ];

        const requestData: PaginatedListRequest<unknown> = {
            start: (state.currentPage - 1) * config.itemsPerPage,
            amount: config.itemsPerPage,
            orderBy: forcedSearchQuery?.orderBy ?? orderBy,
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

    function toggleSorting(columnKey: string): void {
        if (!items.length || items.length <= 1) {
            return;
        }

        if (state.sortColumnKey === columnKey) {
            state.sortDirection =
                state.sortDirection === 'desc' ? 'asc' : state.sortDirection === 'asc' ? false : 'desc';
        } else {
            state.sortColumnKey = columnKey;
            state.sortDirection = 'desc';
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
