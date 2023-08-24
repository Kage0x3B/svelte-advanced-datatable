<script lang="ts">
    import InternalDataTable from '$lib/internal/InternalDataTable.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
    import type { DataTableConfig, FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_CONFIG, DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';
    import { mergeDataTableConfigDefaults } from '$lib/util/dataTableConfigUtil.js';
    import { clamp } from '$lib/util/generalUtil.js';
    import { createMessageFormatter } from '$lib/util/messageFormatterUtil.js';
    import { setContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import { Icon, Spinner } from 'skeleton';
    import DataRow from './SkeletonDataRow.svelte';
    import DataTablePagination from './SkeletonDataTablePagination.svelte';
    import SearchField from './SkeletonSearchField.svelte';

    let configExport: DataTableConfig<unknown>;
    export { configExport as config };

    const config: FullDataTableConfig<unknown> = mergeDataTableConfigDefaults<unknown>(configExport);
    setContext(DATATABLE_CONFIG, config);
    const format: Readable<MessageFormatter> = createMessageFormatter<unknown>(config);
    setContext(DATATABLE_MESSAGE_FORMATTER, format);

    export let striped = false;
    export let highlight = false;
    export let centered = false;
    export let responsive = false;
    export let hoverable = true;

    let currentPage = 1;
    let searchInput = '';
    let searchQuery: ParsedSearchQuery | undefined;
</script>

<InternalDataTable
    let:queryObserver
    let:columnProperties
    let:itemAmount
    let:pageAmount
    let:items
    let:sortDirection
    let:toggleSorting
    let:sortColumnKey
    let:currentOpenIndex
    let:open
    let:highlightedItemId
    {searchInput}
    {searchQuery}
    {currentPage}
>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex flex-row align-items-center">
            <slot name="header-first" />
            {#if config.enableSearch}
                <div class="me-3">
                    <SearchField bind:searchInput bind:searchQuery />
                </div>
            {/if}
            <slot name="header-after-search" />
            {#if queryObserver.isLoading}
                <div in:fade|local={{ duration: 100 }} out:fade|local={{ duration: 300 }}>
                    <Spinner color="primary" />
                </div>
            {/if}
            <slot name="header-middle" />
        </div>
        {#if config.enablePagination && config.showTopPagination}
            <div class="d-flex flex-row justify-content-center flex-wrap">
                <div class="d-flex align-items-center">
                    {#if itemAmount >= 0}
                        <span class="text-muted me-3 disable-text-wrap"
                            >{(currentPage - 1) * config.itemsPerPage + 1}
                            - {clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)}
                            von {itemAmount}</span
                        >
                    {/if}
                </div>
                <DataTablePagination bind:currentPage {pageAmount} />
            </div>
        {/if}
    </div>

    <div class="table-container" class:table-responsive={responsive}>
        <table class="table" class:centered class:highlight class:striped class:table-hover={hoverable}>
            {#if config.showTableHeader}
                <thead>
                    <tr>
                        {#each Object.entries(columnProperties) as [key, colProp], i}
                            {#if !colProp.hidden}
                                <th on:click={() => colProp.sortable && toggleSorting(key)}>
                                    {$format(`dataTable.${config.type}.${key}.label`)}
                                    {#if colProp.sortable && items.length > 1}
                                        {#if sortColumnKey === key && sortDirection === 'asc'}
                                            <Icon name="chevron-compact-up" />
                                        {:else if sortColumnKey === key && sortDirection === 'desc'}
                                            <Icon name="chevron-compact-down" />
                                        {:else}
                                            <Icon name="chevron-expand" />
                                        {/if}
                                    {/if}
                                </th>
                            {/if}
                        {/each}
                    </tr>
                </thead>
            {/if}
            <tbody>
                {#each items as item, index (item[config.dataUniquePropertyKey])}
                    <DataRow
                        {item}
                        {index}
                        openIndex={currentOpenIndex}
                        {open}
                        onClick={config.onItemClick}
                        highlighted={highlightedItemId === item[config.dataUniquePropertyKey]}
                    />
                {/each}
            </tbody>
        </table>
    </div>
    {#if items.length > 10 && config.enablePagination && config.showBottomPagination}
        <div class="d-flex justify-content-between align-items-center" transition:fade|local={{ duration: 200 }}>
            <div>
                {#if queryObserver.isLoading}
                    <Spinner color="primary" />
                {/if}
            </div>
            <div class="d-flex flex-row align-items-baseline">
                {#if itemAmount >= 0}
                    <span class="text-muted me-3"
                        >{(currentPage - 1) * config.itemsPerPage + 1}
                        - {clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)} von {itemAmount}</span
                    >
                {/if}
                <DataTablePagination bind:currentPage {pageAmount} />
            </div>
        </div>
    {/if}
</InternalDataTable>

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
