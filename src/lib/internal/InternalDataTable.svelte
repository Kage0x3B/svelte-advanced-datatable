<script lang='ts'>
	import { browser } from '$app/env';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { writable } from 'svelte/store';
	import type { QueryObserver } from '../dataSource/QueryObserver.js';
	import { buildErrorQueryObserver, buildLoadingQueryObserver, buildSuccessQueryObserver } from '../dataSource/QueryObserver.js';
	import type { ForcedSearchQuery } from '../searchParser/ForcedSearchQuery.js';
	import type { FullDataTableConfig } from '../types/DataTableConfig.js';
	import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
	import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
	import type { ParsedSearchQuery } from '../searchParser/ParsedSearchQuery.js';
	import type { SortDirection } from '../types/SortDirection.js';
	import { DATATABLE_CONFIG } from '../util/ContextKey.js';
	import { buildColumnPropertyData } from '../util/dataTableUtil.js';
	import { isStore, wrapPossibleStore } from '../util/generalUtil.js';

	const config: FullDataTableConfig = getContext(DATATABLE_CONFIG);

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
	let dataQueryObserver: Writable<QueryObserver> = writable(buildLoadingQueryObserver());

	$: refresh(currentPage, config.itemsPerPage, sortColumnKey, sortDirection, config.forcedSearchQuery, searchQuery);
	$: $dataQueryObserver.isSuccess && updateData($dataQueryObserver.data);
	$: pageAmount = Math.ceil(Math.max(1, itemAmount / config.itemsPerPage));

	function updateData(data: PaginatedListResponse) {
		const calculatedMaxItemAmount = (currentPage - 1) * config.itemsPerPage + data.items.length;

		currentOpenIndex = -1;
		itemAmount = calculatedMaxItemAmount >= config.itemsPerPage ? data.totalCount : Math.min(data.totalCount, calculatedMaxItemAmount);
		items = data.items;

		if (items.length === 1) {
			currentOpenIndex = 0;
		}
	}

	const internalColumnProperties = buildColumnPropertyData(config.columnProperties);

	function refresh(currentPage: number, itemsPerPage: number, sortColumnKey: string, sortDirection: SortDirection, forcedSearchQuery: ForcedSearchQuery | undefined, searchQuery?: ParsedSearchQuery) {
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

		const requestData: PaginatedListRequest = {
			start: (currentPage - 1) * itemsPerPage,
			amount: itemsPerPage,
			orderBy: forcedSearchQuery?.orderBy ?? orderBy,
			searchQuery: {
				...searchQuery,
				searchFilters,
				searchText: forcedSearchQuery?.searchQuery?.searchText ?? searchQuery?.searchText
			}
		};

		const response = $dataSource.requestData(requestData);

		if (isStore(response)) {
			dataQueryObserver = response;
		} else {
			$dataQueryObserver = buildLoadingQueryObserver();

			response
				.then(data => $dataQueryObserver = buildSuccessQueryObserver(data))
				.catch(err => $dataQueryObserver = buildErrorQueryObserver(err as Error));
		}
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

	$: browser && config.showSearch && updateNavigation($page.url.searchParams, searchInput);

	const open = (index: number) => currentOpenIndex = items.length <= 1 ? 0 : index;

	onMount(() => {
		if (config.showSearch && $page.url.searchParams.has('query')) {
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
