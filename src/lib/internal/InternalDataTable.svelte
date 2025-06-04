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
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import type { SortDirection } from '$lib/types/SortDirection.js';
    import { configContext, dataSourceContext } from '$lib/util/context.js';
    import { buildColumnPropertyData } from '$lib/util/dataTableUtil.js';
    import type { Snippet } from 'svelte';

    const config = $derived(configContext.get().current);
    const forcedSearchQuery = $derived(config.forcedSearchQuery);
    const dataSource = $derived(dataSourceContext.get().current);

    export interface Props {
        currentPage: number;
        searchQuery: ParsedSearchQuery | undefined;
        children: Snippet<
            [
                {
                    queryResult: QueryResult<unknown>;
                    columnProperties: Record<string, ComponentTypeProperties>;
                    itemAmount: number;
                    pageAmount: number;
                    items: Record<string, unknown>[];
                    sortDirection: SortDirection;
                    toggleSorting: (columnKey: string) => void;
                    sortColumnKey: string | undefined;
                    open: (index: number) => void;
                    currentOpenIndex: number | undefined;
                    highlightedItemId: string | undefined;
                }
            ]
        >;
    }

    let { currentPage, searchQuery, children }: Props = $props();

    dataSource.setConfig?.(config);
    $effect(() => dataSource.setConfig?.(config));
    $effect(() => dataSource.onMount?.());

    const queryResult = $derived(dataSource.queryResult);
    const queryData = $derived(queryResult.data);
    const itemAmount = $derived.by(() => {
        if (!queryData?.items) {
            return -1;
        }

        const calculatedMaxItemAmount = (currentPage - 1) * config.itemsPerPage + queryData.items.length;

        return calculatedMaxItemAmount >= config.itemsPerPage
            ? queryData.totalCount
            : Math.min(queryData.totalCount, calculatedMaxItemAmount);
    });

    const pageAmount = $derived(Math.ceil(Math.max(1, itemAmount / config.itemsPerPage)));
    const items: Record<string, unknown>[] = $derived((queryData?.items ?? []) as Record<string, unknown>[]);
    let currentOpenIndex: number | undefined = $state();

    let sortColumnKey: string | undefined = $state(config.defaultSort?.columnKey);
    let sortDirection: SortDirection = $state(config.defaultSort?.direction ?? false);

    let highlightedItemId = $derived(config.highlightedItemId);

    $effect(() => {
        if (items.length === 1 && currentOpenIndex === undefined) {
            currentOpenIndex = 0;
        }
    });

    const internalColumnProperties = $derived(buildColumnPropertyData(config.columnProperties));

    function refresh() {
        let orderBy: PaginatedListRequest<unknown>['orderBy'] | undefined;

        if (sortColumnKey && sortDirection) {
            orderBy = {
                column: sortColumnKey,
                order: sortDirection
            };
        }

        const searchFilters = [
            ...(searchQuery?.searchFilters ?? []),
            ...(forcedSearchQuery?.searchQuery?.searchFilters ?? [])
        ];

        const requestData: PaginatedListRequest<unknown> = {
            start: (currentPage - 1) * config.itemsPerPage,
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

        if (sortColumnKey === columnKey) {
            sortDirection = sortDirection === 'desc' ? 'asc' : sortDirection === 'asc' ? false : 'desc';
        } else {
            sortColumnKey = columnKey;
            sortDirection = 'desc';
        }
    }

    const open = (index: number) => {
        currentOpenIndex = items.length <= 1 ? 0 : index;
    };
</script>

{@render children({
    queryResult,
    columnProperties: internalColumnProperties,
    itemAmount,
    pageAmount,
    items,
    sortDirection,
    toggleSorting,
    sortColumnKey,
    open,
    currentOpenIndex,
    highlightedItemId
})}
