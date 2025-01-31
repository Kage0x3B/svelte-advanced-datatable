<script lang="ts">
    import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
    import type { IDataSource } from '$lib/dataSource/index.js';
    import DataTable from '$lib/internal/index.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { DataTableConfig, FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { setConfigContext, setDataSourceContext, setMessageFormatterContext } from '$lib/util/context.js';
    import { mergeDataTableConfigDefaults } from '$lib/util/dataTableConfigUtil.js';
    import { clamp } from '$lib/util/generalUtil.js';
    import { createMessageFormatter } from '$lib/util/messageFormatterUtil.svelte.js';
    import type { Component, Snippet } from 'svelte';
    import type { ClassValue } from 'svelte/elements';
    import { fade } from 'svelte/transition';
    import type { ThemeSize } from '../../routes/util/type/Theme.js';
    import DataRow from './DaisyUiDataRow.svelte';
    import DaisyUiDataTablePagination from './DaisyUiDataTablePagination.svelte';
    import SearchField from './DaisyUiSearchField.svelte';
    import SortUpIcon from '$lib/daisyUi/icons/SortUpIcon.svelte';
    import SortDownIcon from '$lib/daisyUi/icons/SortDownIcon.svelte';
    import SortIcon from '$lib/daisyUi/icons/SortIcon.svelte';

    interface Props {
        config: DataTableConfig<any>;

        /**
         * The data source where the dataTable requests the table data from
         */
        dataSource: IDataSource<any>;

        icons?: Partial<Record<DataTableIcon, Component>>;

        class?: ClassValue;
        striped?: boolean;
        hoverable?: boolean;
        size?: ThemeSize;

        headerFirst?: Snippet;
        headerAfterSearch?: Snippet;
        headerMiddle?: Snippet;
    }

    let {
        config: configExport,
        dataSource,
        size = 'md',
        striped = false,
        hoverable = true,
        class: classExport,
        headerFirst,
        headerAfterSearch,
        headerMiddle
    }: Props = $props();

    let config: FullDataTableConfig<unknown> = $derived(mergeDataTableConfigDefaults<unknown>(configExport));
    let format: MessageFormatter = $derived(createMessageFormatter<unknown>(config));

    setConfigContext(() => config);
    setDataSourceContext(() => dataSource);
    setMessageFormatterContext(() => format);

    let currentPage = $state(1);
    let searchInput = $state('');
    let searchQuery = $state<ParsedSearchQuery | undefined>(undefined);
</script>

<DataTable.Root {searchQuery} {currentPage}>
    {#snippet children({
        queryResult,
        columnProperties,
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
        <div class="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
            <div class="flex flex-row items-center gap-3">
                {@render headerFirst?.()}
                {#if config.enableSearch}
                    <SearchField bind:searchInput bind:searchQuery />
                {/if}
                {@render headerAfterSearch?.()}
                {@render headerMiddle?.()}
            </div>
            <div class="flex flex-row items-center justify-end gap-3">
                {#if queryResult.isLoading()}
                    <div in:fade|local={{ duration: 100 }} out:fade|local={{ duration: 300 }}>
                        <span class="loading loading-spinner"></span>
                    </div>
                {/if}
                {#if config.enablePagination && config.showTopPagination}
                    {#if itemAmount >= 0}
                        {@const startItemIndex = (currentPage - 1) * config.itemsPerPage + 1}
                        {@const endItemIndex = clamp(
                            currentPage * config.itemsPerPage,
                            config.itemsPerPage,
                            itemAmount
                        )}

                        <span class="text-base-content/80 whitespace-nowrap"
                            >{startItemIndex}
                            - {endItemIndex}
                            von {itemAmount}</span
                        >
                    {:else}
                        <span class="text-base-content/80 whitespace-nowrap">0 - 0 von {Math.max(0, itemAmount)}</span>
                    {/if}
                    <DaisyUiDataTablePagination bind:currentPage {pageAmount} />
                {/if}
            </div>
        </div>

        <div class="table-container overflow-x-auto">
            <table
                class={[
                    'table-sm table w-full',
                    {
                        'table-zebra': striped,
                        'table-hover': hoverable,
                        'table-xs': size === 'xs',
                        'table-sm': size === 'sm',
                        'table-md': size === 'md',
                        'table-lg': size === 'lg',
                        'table-xl': size === 'xl'
                    },
                    classExport
                ]}
            >
                {#if config.showTableHeader}
                    <thead>
                        <tr>
                            {#each Object.entries(columnProperties) as [key, colProp] (key)}
                                {#if !colProp.hidden}
                                    <th
                                        class="whitespace-normal"
                                        class:w-12={key === 'actions'}
                                        onclick={() => colProp.sortable && toggleSorting(key)}
                                    >
                                        <div class="flex flex-row items-center">
                                            <span class="mr-2">
                                                {format(`dataTable.${config.type}.${key}.label`)}
                                            </span>
                                            {#if colProp.sortable && items.length > 1}
                                                {#if sortColumnKey === key && sortDirection === 'asc'}
                                                    <SortUpIcon />
                                                {:else if sortColumnKey === key && sortDirection === 'desc'}
                                                    <SortDownIcon />
                                                {:else}
                                                    <SortIcon />
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
            <div class="flex flex-wrap items-center justify-between" transition:fade|local={{ duration: 200 }}>
                <div>
                    {#if queryResult.isLoading()}
                        <span class="loading loading-spinner"></span>
                    {/if}
                </div>
                <div class="flex flex-row items-baseline">
                    {#if itemAmount >= 0}
                        <span class="text-base-content/80 mr-3 whitespace-nowrap"
                            >{(currentPage - 1) * config.itemsPerPage + 1}
                            - {clamp(currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)} von {itemAmount}</span
                        >
                    {/if}
                    <DaisyUiDataTablePagination bind:currentPage {pageAmount} />
                </div>
            </div>
        {/if}
    {/snippet}
</DataTable.Root>

<style>
    .table-container {
        width: 100%;
    }

    :global(.table-container td) {
        max-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(.table-container td:last-child) {
        width: 3rem !important;
        padding: 0 !important;
        text-align: center;
    }
</style>
