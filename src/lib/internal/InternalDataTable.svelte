<script lang="ts">
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { QueryObserver } from '$lib/dataSource/QueryObserver.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { ForcedSearchQuery } from '$lib/searchParser/ForcedSearchQuery.js';
    import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
    import type { SortDirection } from '$lib/types/SortDirection.js';
    import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';
    import { buildColumnPropertyData } from '$lib/util/dataTableUtil.js';
    import { browser } from '$lib/util/generalUtil.js';
    import { getContext, type Snippet } from 'svelte';

    let config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);
    let forcedSearchQuery = config.forcedSearchQuery;

    interface Props {
        currentPage: number;
        searchInput: string;
        searchQuery: ParsedSearchQuery | undefined;
        children: Snippet<
            [
                {
                    queryObserver: QueryObserver<unknown>;
                    columnProperties: Record<string, ComponentTypeProperties>;
                    itemAmount: number;
                    pageAmount: number;
                    items: Record<string, unknown>[];
                    sortDirection: SortDirection;
                    toggleSorting: (columnKey: string) => void;
                    sortColumnKey: string;
                    open: (index: number) => void;
                    currentOpenIndex: number | undefined;
                    highlightedItemId: string | undefined;
                }
            ]
        >;
    }

    let { currentPage, searchInput, searchQuery, children }: Props = $props();

    let itemAmount = $state(-1);
    let pageAmount = $derived(Math.ceil(Math.max(1, itemAmount / config.itemsPerPage)));
    let items: unknown[] = $state([]);
    let currentOpenIndex: number | undefined = $state();

    let sortColumnKey: string | undefined = $state(config.defaultSort.columnKey);
    let sortDirection: SortDirection = $state(config.defaultSort.direction ?? false);

    let highlightedItemId = $state(config.highlightedItemId);
    let dataQueryObserver: QueryObserver<unknown> | undefined = $state();

    $effect(() => {
        config.dataSource.init?.(config);
        dataQueryObserver = config.dataSource.getQueryObserver();
    });

    function updateData(data: PaginatedListResponse<unknown>) {
        if (!data || !data.items) {
            return;
        }

        const calculatedMaxItemAmount = (currentPage - 1) * config.itemsPerPage + data.items.length;

        currentOpenIndex = -1;
        itemAmount =
            calculatedMaxItemAmount >= config.itemsPerPage
                ? data.totalCount
                : Math.min(data.totalCount, calculatedMaxItemAmount);
        items = data.items;

        if (items.length === 1) {
            currentOpenIndex = 0;
        }
    }

    let internalColumnProperties = $derived(buildColumnPropertyData(config.columnProperties));

    function refresh(
        currentPage: number,
        itemsPerPage: number,
        sortColumnKey: string,
        sortDirection: SortDirection,
        forcedSearchQuery: ForcedSearchQuery<unknown> | undefined,
        searchQuery?: ParsedSearchQuery
    ) {
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
            start: (currentPage - 1) * itemsPerPage,
            amount: itemsPerPage,
            orderBy: forcedSearchQuery?.orderBy ?? orderBy,
            searchQuery: {
                ...searchQuery,
                searchFilters,
                searchText: forcedSearchQuery?.searchQuery?.searchText ?? searchQuery?.searchText ?? ''
            }
        };

        config.dataSource.requestData(requestData);
    }

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

    $effect(() => {
        config.dataSource.onMount?.();
    });

    $effect(() => {
        refresh(currentPage, config.itemsPerPage, sortColumnKey, sortDirection, forcedSearchQuery, searchQuery);
    });

    $effect(() => {
        dataQueryObserver?.isSuccess && updateData(dataQueryObserver?.data);
    });
</script>

{@render children({
    queryObserver: dataQueryObserver,
    columnProperties: internalColumnProperties,
    itemAmount,
    pageAmount,
    items,
    sortDirection,
    toggleSorting,
    sortColumnKey,
    open,
    currentOpenIndex,
    highlightedItemId: $highlightedItemId
})}
