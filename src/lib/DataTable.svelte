<script lang='ts'>
	import { browser } from '$app/env';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SearchField from '$lib/SearchField.svelte';
	import { onMount, setContext } from 'svelte';
	import type { Readable, Writable } from 'svelte/store';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { Icon, Spinner } from 'sveltestrap';
	import DataRow from './DataRow.svelte';
	import type { QueryObserver } from './dataSource/QueryObserver.js';
	import { buildErrorQueryObserver, buildLoadingQueryObserver, buildSuccessQueryObserver } from './dataSource/QueryObserver.js';
	import DataTablePagination from './DataTablePagination.svelte';
	import type { ForcedSearchQuery } from './searchParser/ForcedSearchQuery.js';
	import type { DataRecord } from './types/DataRecord.js';
	import type { DataTableConfig, FullDataTableConfig } from './types/DataTableConfig.js';
	import type { MessageFormatter } from './types/MessageFormatter.js';
	import type { PaginatedListRequest } from './types/PaginatedListRequest.js';
	import type { PaginatedListResponse } from './types/PaginatedListResponse.js';
	import type { ParsedSearchQuery } from './types/ParsedSearchQuery.js';
	import type { SortDirection } from './types/SortDirection.js';
	import { DATATABLE_CONFIG, DATATABLE_MESSAGE_FORMATTER } from './util/ContextKey.js';
	import { mergeDataTableConfigDefaults } from './util/dataTableConfigUtil.js';
	import { buildColumnPropertyData } from './util/dataTableUtil.js';
	import { clamp, isStore, wrapPossibleStore } from './util/generalUtil.js';
	import { createMessageFormatter } from './util/messageFormatterUtil.js';

	let configExport: DataTableConfig;
	export { configExport as config };

	const config: FullDataTableConfig = mergeDataTableConfigDefaults<DataRecord>(configExport);
	setContext(DATATABLE_CONFIG, config);
	const format: Readable<MessageFormatter> = createMessageFormatter<DataRecord>(config);
	setContext(DATATABLE_MESSAGE_FORMATTER, format);

	export let striped = false;
	export let highlight = false;
	export let centered = false;
	export let responsive = false;
	export let hoverable = true;

	let isInitialized = false;
	let currentPage = 1;
	let itemAmount = -1;
	let pageAmount;
	let items = [];
	let currentOpenIndex;
	let searchInput = '';
	let searchQuery: ParsedSearchQuery | undefined;

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

<div class='d-flex justify-content-between align-items-center mb-3'>
	<div class='d-flex flex-row align-items-center'>
		<slot name='header-first' />
		{#if config.showSearch}
			<div class='me-3'>
				<SearchField bind:searchInput bind:searchQuery />
			</div>
		{/if}
		<slot name='header-after-search' />
		{#if $dataQueryObserver.isLoading}
			<div in:fade|local={{duration: 100}} out:fade|local={{duration: 300}}>
				<Spinner color='primary' />
			</div>
		{/if}
		<slot name='header-middle' />
	</div>
	{#if config.showPagination && config.showTopPagination}
		<div class='d-flex flex-row justify-content-center flex-wrap'>
			<div class='d-flex align-items-center'>
				{#if itemAmount >= 0}
                    <span class='text-muted me-3 disable-text-wrap'>{(currentPage - 1) * config.itemsPerPage + 1}
						- {clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)}
						von {itemAmount}</span>
				{/if}
			</div>
			<DataTablePagination bind:currentPage {pageAmount} />
		</div>
	{/if}
</div>

<div class='table-container' class:table-responsive={responsive}>
	<table class='table' class:centered class:highlight class:striped class:table-hover={hoverable}>
		<thead>
			<tr>
				{#each Object.entries(internalColumnProperties) as [key, colProp], i}
					{#if !colProp.cellHidden && !colProp.hidden}
						<th on:click={() => colProp.sortable && toggleSorting(key)}>
							{$format(`dataTable.${config.type}.${key}.label`)}
							{#if colProp.sortable && items.length > 1}
								{#if sortColumnKey === key && sortDirection === 'asc'}
									<Icon name='chevron-compact-up' />
								{:else if sortColumnKey === key && sortDirection === 'desc'}
									<Icon name='chevron-compact-down' />
								{:else}
									<Icon name='chevron-expand' />
								{/if}
							{/if}
						</th>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each items as item, index (item[config.dataUniquePropertyKey])}
				<DataRow dataTableType={config.type} columnProperties={internalColumnProperties} {item} modalComponent={config.modalComponent}
					{index}
					openIndex={currentOpenIndex} {open} onClick={config.onItemClick}
					highlighted={$highlightedItemId === item[config.dataUniquePropertyKey]} />
			{/each}
		</tbody>
	</table>
</div>
{#if items.length > 10 && !config.disablePagination}
	<div class='d-flex justify-content-between align-items-center' transition:fade|local={{duration: 200}}>
		<div>
			{#if $dataQueryObserver.isLoading}
				<Spinner color='primary' />
			{/if}
		</div>
		<div class='d-flex flex-row align-items-baseline'>
			{#if itemAmount >= 0}
                <span class='text-muted me-3'>{(currentPage - 1) * config.itemsPerPage + 1}
					- {clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)} von {itemAmount}</span>
			{/if}
			<DataTablePagination bind:currentPage {pageAmount} />
		</div>
	</div>
{/if}

<style>
    .table-container {
        overflow-x: scroll;
    }

    table {
        -webkit-overflow-scrolling: touch;
        border-collapse: separate;
        border-spacing: 0;
    }

    thead {
        border-bottom: 0;
    }

    th {
        transition: background-color 0.2s;
        cursor: pointer;
    }

    th:hover {
        background-color: rgba(0, 0, 0, 0.075);
    }
</style>
