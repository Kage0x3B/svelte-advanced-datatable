<script lang="ts">
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { QueryResult } from '$lib/dataSource/QueryResult.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
    import type { SortDirection } from '$lib/types/SortDirection.js';
    import { getConfigContext, getDataSourceContext } from '$lib/util/context.js';
    import { buildColumnPropertyData } from '$lib/util/dataTableUtil.js';
    import { browser } from '$lib/util/generalUtil.js';
    import { type Snippet, untrack } from 'svelte';

    let config = getConfigContext()();
    let forcedSearchQuery = $derived(config.forcedSearchQuery);
    let dataSource = getDataSourceContext()();

    interface Props {
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

    let itemAmount = $state(-1);
    let pageAmount = $derived(Math.ceil(Math.max(1, itemAmount / config.itemsPerPage)));
    let items: Record<string, unknown>[] = $state([]);
    let currentOpenIndex: number | undefined = $state();

    let sortColumnKey: string | undefined = $state(config.defaultSort?.columnKey);
    let sortDirection: SortDirection = $state(config.defaultSort?.direction ?? false);

    let highlightedItemId = $derived(config.highlightedItemId);

    dataSource.setConfig?.(config);
    let queryResult = $derived(dataSource.queryResult);

    $effect(() => dataSource.onMount?.());

    function updateData(data: PaginatedListResponse<unknown>) {
        untrack(() => {
            const calculatedMaxItemAmount = (currentPage - 1) * config.itemsPerPage + data.items.length;

            itemAmount =
                calculatedMaxItemAmount >= config.itemsPerPage
                    ? data.totalCount
                    : Math.min(data.totalCount, calculatedMaxItemAmount);
            items = data.items as Record<string, unknown>[];

            currentOpenIndex = items.length === 1 ? 0 : -1;
        });
    }

    $effect(() => {
        if (queryResult.isSuccess()) {
            updateData(queryResult.data);
        }
    });

    let internalColumnProperties = $derived(buildColumnPropertyData(config.columnProperties));

    function refresh() {
        if (!browser) {
            return;
        }

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
