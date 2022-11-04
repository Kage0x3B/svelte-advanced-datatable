<script lang='ts'>
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { QueryObserver } from '$lib/dataSource/QueryObserver.js';
	import type { ParsedSearchQuery } from '$lib/searchParser';
	import type { ForcedSearchQuery } from '$lib/searchParser/ForcedSearchQuery.js';
	import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
	import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
	import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
	import type { SortDirection } from '$lib/types/SortDirection.js';
	import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';
	import { buildColumnPropertyData } from '$lib/util/dataTableUtil.js';
	import { browser, wrapPossibleStore } from '$lib/util/generalUtil.js';
	import { getContext, onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);
	const forcedSearchQuery = config.forcedSearchQuery;

	export let currentPage: number;
	export let searchInput: string;
	export let searchQuery: ParsedSearchQuery | undefined;

	let isInitialized = false;
	let itemAmount = -1;
	let pageAmount;
	let items = [];
	let currentOpenIndex;

	let sortColumnKey: string = config.defaultSort.columnKey;
	let sortDirection: SortDirection = config.defaultSort.direction ?? false;

	const dataSource = wrapPossibleStore(config.dataSource);
	const highlightedItemId = wrapPossibleStore(config.highlightedItemId);
	let dataQueryObserver: Readable<QueryObserver<unknown>>;
	$: if ($dataSource) {
		$dataSource.init && $dataSource.init(config);
		dataQueryObserver = $dataSource.getQueryObserver();
	}

	$: refresh(currentPage, config.itemsPerPage, sortColumnKey, sortDirection, $forcedSearchQuery, searchQuery);
	$: $dataQueryObserver.isSuccess && updateData($dataQueryObserver.data);
	$: pageAmount = Math.ceil(Math.max(1, itemAmount / config.itemsPerPage));

	function updateData(data: PaginatedListResponse<unknown>) {
		if (!data || !data.items) {
			return;
		}

		const calculatedMaxItemAmount = (currentPage - 1) * config.itemsPerPage + data.items.length;

		currentOpenIndex = -1;
		itemAmount = calculatedMaxItemAmount >= config.itemsPerPage ? data.totalCount : Math.min(data.totalCount, calculatedMaxItemAmount);
		items = data.items;

		if (items.length === 1) {
			currentOpenIndex = 0;
		}
	}

	const internalColumnProperties = buildColumnPropertyData(config.columnProperties);

	function refresh(currentPage: number, itemsPerPage: number, sortColumnKey: string, sortDirection: SortDirection, forcedSearchQuery: ForcedSearchQuery<unknown> | undefined, searchQuery?: ParsedSearchQuery) {
		if (!browser) {
			return;
		}

		let orderBy;

		if (sortColumnKey && sortDirection) {
			orderBy = {
				column: sortColumnKey,
				order: sortDirection
			};
		}

		const searchFilters = [...(searchQuery?.searchFilters ?? []), ...(forcedSearchQuery?.searchQuery?.searchFilters ?? [])];

		const requestData: PaginatedListRequest<unknown> = {
			start: (currentPage - 1) * itemsPerPage,
			amount: itemsPerPage,
			orderBy: forcedSearchQuery?.orderBy ?? orderBy,
			searchQuery: {
				...searchQuery,
				searchFilters,
				searchText: forcedSearchQuery?.searchQuery?.searchText ?? searchQuery?.searchText
			}
		};

		$dataSource.requestData(requestData);
	}

	function toggleSorting(columnKey) {
		if (!items || items.length <= 1) {
			return;
		}

		if (sortColumnKey === columnKey) {
			sortDirection = sortDirection === 'desc' ? 'asc' : sortDirection === 'asc' ? false : 'desc';
		} else {
			sortColumnKey = columnKey;
			sortDirection = 'desc';
		}
	}

	async function updateNavigation(searchParams: URLSearchParams, searchInput: string): Promise<void> {
		if (!isInitialized || (searchParams.get('query') ?? '') === searchInput) {
			return;
		}

		if (searchInput.trim()) {
			searchParams.set('query', encodeURIComponent(searchInput));
		} else {
			searchParams.delete('query');
		}

		await goto(`?${searchParams.toString()}`, { replaceState: true, keepfocus: true });
	}

	$: browser && config.enableSearch && updateNavigation($page.url.searchParams, searchInput);

	const open = (index: number) => currentOpenIndex = items.length <= 1 ? 0 : index;

	onMount(() => {
		if (config.enableSearch && $page.url.searchParams.has('query')) {
			searchInput = decodeURIComponent($page.url.searchParams.get('query'));
		}

		$dataSource.onMount && $dataSource.onMount();

		isInitialized = true;
	});

	afterNavigate(() => {
		$dataSource.afterNavigate && $dataSource.afterNavigate();
	});
</script>

<slot queryObserver={$dataQueryObserver} columnProperties={internalColumnProperties} {itemAmount} {pageAmount} {items} {sortDirection} {toggleSorting} {sortColumnKey} {open} {currentOpenIndex} highlightedItemId={$highlightedItemId} />
