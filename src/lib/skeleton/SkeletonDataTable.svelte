<script lang="ts">
    import InternalDataTable from '$lib/internal/InternalDataTable.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
    import type { DataTableConfig, FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_CONFIG, DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';
    import { mergeDataTableConfigDefaults } from '$lib/util/dataTableConfigUtil.js';
    import { clamp } from '$lib/util/generalUtil.js';
    import { createMessageFormatter } from '$lib/util/messageFormatterUtil.js';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
    import { setContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import { fade } from 'svelte/transition';
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

<!--
@component

Datatable component for the https://www.skeleton.dev ui library (version 2.0+).
-->

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
    <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mb-3">
        <div class="flex flex-row items-center">
            <slot name="header-first" />
            {#if config.enableSearch}
                <div class="mr-3">
                    <SearchField bind:searchInput bind:searchQuery />
                </div>
            {/if}
            <slot name="header-after-search" />
            {#if queryObserver.isLoading}
                <div in:fade|local={{ duration: 100 }} out:fade|local={{ duration: 300 }}>
                    <ProgressRadial stroke={100} width="w-8" meter="stroke-primary-500" track="stroke-primary-500/30" />
                </div>
            {/if}

            <slot name="header-middle" />
        </div>
        {#if config.enablePagination && config.showTopPagination}
            <div class="flex flex-row justify-center flex-wrap">
                <div class="flex items-center">
                    {#if itemAmount >= 0}
                        {@const firstIndex = (currentPage - 1) * config.itemsPerPage + 1}
                        {@const lastIndex = clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)}
                        <span class="text-surface-500 mr-3 whitespace-nowrap"
                            >{$format(`pagination.currentlyShowing`, {
                                values: { firstIndex, lastIndex, itemAmount },
                                default: `${firstIndex} - ${lastIndex} of ${itemAmount}`
                            })}
                        </span>
                    {/if}
                </div>
                <DataTablePagination bind:currentPage {pageAmount} />
            </div>
        {/if}
    </div>

    <div class="table-container" class:table-responsive={responsive}>
        <table class="table" class:highlight class:table-hover={hoverable}>
            {#if config.showTableHeader}
                <thead>
                    <tr>
                        {#each Object.entries(columnProperties) as [key, colProp]}
                            {#if !colProp.hidden}
                                <th on:click={() => colProp.sortable && toggleSorting(key)}>
                                    <div class="flex flex-row justify-between items-center">
                                        <span class="min-w-1/2">{$format(`dataTable.${config.type}.${key}.label`)}</span
                                        >
                                        {#if colProp.sortable && items.length > 1}
                                            {#if sortColumnKey === key && sortDirection === 'asc'}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-chevron-compact-up min-w-[16px] w-[16px]"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M7.776 5.553a.5.5 0 0 1 .448 0l6 3a.5.5 0 1 1-.448.894L8 6.56 2.224 9.447a.5.5 0 1 1-.448-.894l6-3z"
                                                    />
                                                </svg>
                                            {:else if sortColumnKey === key && sortDirection === 'desc'}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-chevron-compact-down min-w-[16px] w-[16px]"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z"
                                                    />
                                                </svg>
                                            {:else}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    class="bi bi-chevron-expand min-w-[16px] w-[16px]"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z"
                                                    />
                                                </svg>
                                            {/if}
                                        {/if}
                                    </div>
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
        <div class="flex justify-between items-center mt-3" transition:fade|local={{ duration: 200 }}>
            <div>
                {#if queryObserver.isLoading}
                    <ProgressRadial stroke={100} width="w-8" meter="stroke-primary-500" track="stroke-primary-500/30" />
                {/if}
            </div>
            <div class="flex flex-row items-baseline">
                {#if itemAmount >= 0}
                    <span class="text-surface-500 mr-3"
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

    table thead th {
        padding: 0.25rem 0.5rem;
    }

    table tbody :global(td) {
        padding: 0.25rem 0.5rem;
    }

    @media (min-width: 768px) {
        table thead th {
            padding: 0.75rem 1rem;
        }

        table tbody :global(td) {
            padding: 0.75rem 1rem;
        }
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
