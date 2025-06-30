<script lang="ts">
    import type { DataTableState, InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { IDataSource } from '$lib/dataSource/IDataSource.js';
    import DataTable from '$lib/internal/index.js';
    import type { DataTableConfig, FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { configContext, dataSourceContext, messageFormatterContext } from '$lib/util/context.js';
    import { mergeDataTableConfigDefaults } from '$lib/util/dataTableConfigUtil.js';
    import { clamp } from '$lib/util/generalUtil.js';
    import { createMessageFormatter } from '$lib/util/messageFormatterUtil.svelte.js';
    import type { Component, Snippet } from 'svelte';
    import { box } from 'svelte-toolbelt';
    import type { ClassValue } from 'svelte/elements';
    import { fade } from 'svelte/transition';
    import type { ThemeSize } from '../../routes/util/type/Theme.js';
    import DaisyUiDataRow from './DaisyUiDataRow.svelte';
    import DaisyUiDataTablePagination from './DaisyUiDataTablePagination.svelte';
    import SearchField from './DaisyUiSearchField.svelte';
    import SortUpIcon from '$lib/daisyUi/icons/SortUpIcon.svelte';
    import SortDownIcon from '$lib/daisyUi/icons/SortDownIcon.svelte';
    import SortIcon from '$lib/daisyUi/icons/SortIcon.svelte';

    interface Props extends CustomSnippetProps {
        config: DataTableConfig<any>;

        /**
         * The data source where the dataTable requests the table data from
         */
        dataSource: IDataSource<unknown>;

        icons?: Partial<Record<DataTableIcon, Component>>;

        class?: ClassValue;
        striped?: boolean;
        hoverable?: boolean;
        size?: ThemeSize;

        headerFirst?: Snippet;
        headerAfterSearch?: Snippet;
        headerMiddle?: Snippet;

        initialState?: DataTableState;
        captureState?: (state: DataTableState) => void;
    }

    let {
        config: configExport,
        dataSource = $bindable(),
        size = 'md',
        striped = false,
        hoverable = true,
        class: classExport,
        headerFirst,
        headerAfterSearch,
        headerMiddle,
        initialState,
        captureState,
        ...customSnippets
    }: Props = $props();

    const config: FullDataTableConfig<unknown> = $derived(mergeDataTableConfigDefaults<unknown>(configExport));
    const format: MessageFormatter = $derived(createMessageFormatter<unknown>(config));

    configContext.set(box.with(() => config));
    dataSourceContext.set(box.with(() => dataSource));
    messageFormatterContext.set(box.with(() => format));

    const state: InternalDataTableState = box.flatten({
        currentPage: box(initialState?.currentPage ?? 1),
        searchInput: box(initialState?.searchInput ?? ''),
        currentOpenIndex: box(initialState?.currentOpenIndex ?? undefined),
        sortColumnKey: box(initialState?.sortColumnKey ?? config.defaultSort?.columnKey),
        sortDirection: box(initialState?.sortDirection ?? config.defaultSort?.direction ?? false)
    });

    const searchQuery = $derived.by(() => {
        try {
            return config.searchParser.parseSearchQuery(state.searchInput);
        } catch (err) {
            console.log(err);

            return undefined;
        }
    });

    export function capture(): DataTableState {
        return {
            currentPage: state.currentPage,
            searchInput: state.searchInput,
            currentOpenIndex: state.currentOpenIndex,
            sortColumnKey: state.sortColumnKey,
            sortDirection: state.sortDirection
        };
    }

    export function restore(snapshot: DataTableState | undefined) {
        if (
            snapshot &&
            ((snapshot.currentPage && snapshot.currentPage !== 1) ||
                snapshot.searchInput ||
                snapshot.currentOpenIndex !== undefined ||
                snapshot.sortColumnKey !== config.defaultSort?.columnKey ||
                snapshot.sortDirection !== config.defaultSort?.direction)
        ) {
            state.currentPage = snapshot.currentPage ?? 1;
            state.searchInput = snapshot.searchInput ?? '';
            state.currentOpenIndex = snapshot.currentOpenIndex ?? undefined;
            state.sortColumnKey = snapshot.sortColumnKey ?? config.defaultSort?.columnKey;
            state.sortDirection = snapshot.sortDirection ?? config.defaultSort?.direction;
        }
    }

    $effect(() =>
        captureState?.({
            currentPage: state.currentPage,
            searchInput: state.searchInput,
            currentOpenIndex: state.currentOpenIndex,
            sortColumnKey: state.sortColumnKey,
            sortDirection: state.sortDirection
        })
    );
</script>

<DataTable.Root {state} {searchQuery}>
    {#snippet children({
        queryResult,
        columnProperties,
        itemAmount,
        pageAmount,
        items,
        toggleSorting,
        open,
        highlightedItemId
    })}
        <div class="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
            <div class="flex flex-row items-center gap-3">
                {@render headerFirst?.()}
                {#if config.enableSearch}
                    <SearchField bind:searchInput={state.searchInput} />
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
                        {@const startItemIndex = (state.currentPage - 1) * config.itemsPerPage + 1}
                        {@const endItemIndex = clamp(
                            state.currentPage * config.itemsPerPage,
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
                    <DaisyUiDataTablePagination {state} bind:currentPage={state.currentPage} {pageAmount} />
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
                                                {#if state.sortColumnKey === key && state.sortDirection === 'asc'}
                                                    <SortUpIcon />
                                                {:else if state.sortColumnKey === key && state.sortDirection === 'desc'}
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
                        <DaisyUiDataRow
                            {state}
                            {item}
                            {index}
                            {open}
                            onClick={config.onItemClick}
                            highlighted={highlightedItemId === item[config.dataUniquePropertyKey]}
                            {customSnippets}
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
                            >{(state.currentPage - 1) * config.itemsPerPage + 1}
                            - {clamp(state.currentPage * config.itemsPerPage, config.itemsPerPage, itemAmount)} von {itemAmount}</span
                        >
                    {/if}
                    <DaisyUiDataTablePagination {state} bind:currentPage={state.currentPage} {pageAmount} />
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
