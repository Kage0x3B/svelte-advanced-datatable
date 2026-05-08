<script lang="ts">
    import type { DataTableState, InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { IDataSource } from '$lib/dataSource/IDataSource.js';
    import DataTable from '$lib/internal/index.js';
    import { createPersistedState, createStores, registerNamespaceCollisions } from '$lib/persistence/index.js';
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
    import DaisyUiDataTableSettings from './DaisyUiDataTableSettings.svelte';
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

        /**
         * Pin the table header row to the top of the nearest scrolling
         * ancestor while the body scrolls. Applies DaisyUI's `table-pin-rows`
         * class, so for the header to actually stick the table needs to be
         * inside a height-constrained scroll container — without one,
         * vertical scroll happens at page level and the header scrolls with
         * it. Defaults to `true`.
         */
        stickyHeader?: boolean;

        headerFirst?: Snippet;
        headerAfterSearch?: Snippet;
        headerMiddle?: Snippet;

        /**
         * Slot rendered when the data source returns zero rows (and is not
         * loading and has no error). Falls back to a muted "No results"
         * message centred under the table header.
         */
        empty?: Snippet;

        /**
         * Slot rendered when the data source surfaces an error via
         * `config.onError`. Receives the error so it can be displayed.
         * Falls back to a DaisyUI alert with the error message.
         */
        errorState?: Snippet<[{ error: Error }]>;

        /**
         * Extra controls appended to the bottom of the settings popover.
         * Useful for app-specific switches (e.g. "show archived").
         */
        settingsExtra?: Snippet;

        initialState?: DataTableState;
        captureState?: (state: DataTableState) => void;
    }

    let {
        config: configExport,
        dataSource = $bindable(),
        size = 'md',
        striped = false,
        hoverable = true,
        stickyHeader = true,
        class: classExport,
        headerFirst,
        headerAfterSearch,
        headerMiddle,
        empty,
        errorState,
        settingsExtra,
        initialState,
        captureState,
        ...customSnippets
    }: Props = $props();

    const config: FullDataTableConfig<unknown> = $derived(mergeDataTableConfigDefaults<unknown>(configExport));
    const format: MessageFormatter = $derived(createMessageFormatter<unknown>(config));

    configContext.set(box.with(() => config));
    dataSourceContext.set(box.with(() => dataSource));
    messageFormatterContext.set(box.with(() => format));

    const stores = createStores(config);
    const tableState: InternalDataTableState = createPersistedState(config, initialState, stores);
    registerNamespaceCollisions(config, stores);

    const searchQuery = $derived.by(() => {
        try {
            return config.searchParser.parseSearchQuery(tableState.searchInput);
        } catch (err) {
            console.log(err);

            return undefined;
        }
    });

    let lastObservedSearchInput = tableState.searchInput;
    $effect(() => {
        if (tableState.searchInput !== lastObservedSearchInput) {
            lastObservedSearchInput = tableState.searchInput;
            tableState.currentPage = 1;
        }
    });

    // Same page-1 reset for items-per-page changes — otherwise switching from
    // 10 to 100 items can land on a now-out-of-range page.
    let lastObservedItemsPerPage = tableState.itemsPerPage;
    $effect(() => {
        if (tableState.itemsPerPage !== lastObservedItemsPerPage) {
            lastObservedItemsPerPage = tableState.itemsPerPage;
            tableState.currentPage = 1;
        }
    });

    function isColumnVisible(key: string): boolean {
        return tableState.columnVisibility[key] !== false;
    }

    /**
     * Derived list of columns the user is allowed to toggle in the settings
     * popover. Skips permanently-hidden config columns and any column marked
     * `alwaysVisible`. Each entry resolves the column's display label via the
     * configured message formatter.
     */
    const toggleableColumns = $derived(
        Object.entries(config.columnProperties)
            .filter(([, colProp]) => colProp && !colProp.hidden && !colProp.alwaysVisible)
            .map(([key]) => ({
                key,
                label: format(`dataTable.${config.type}.${key}.label`)
            }))
    );

    /** Number of <th>s actually rendered, used for state-row colspan. */
    const visibleColumnCount = $derived(
        Object.entries(config.columnProperties).filter(
            ([key, colProp]) => colProp && !colProp.hidden && isColumnVisible(key)
        ).length
    );

    function setColumnVisible(key: string, visible: boolean): void {
        const next = { ...tableState.columnVisibility };
        if (visible) {
            delete next[key];
        } else {
            next[key] = false;
        }
        tableState.columnVisibility = next;
    }

    /** True when the user has resized at least one column. Drives the
     * "Reset column widths" button's visibility in the settings popover. */
    const hasCustomColumnWidths = $derived(Object.keys(tableState.columnWidths).length > 0);

    function resetColumnWidths(): void {
        tableState.columnWidths = {};
    }

    /** Live width of the table-container element. Bound via Svelte's
     * `bind:clientWidth`, so it updates on every window resize. Locked
     * column fractions multiply against this to compute each `<th>`'s pixel
     * width — the table grows past the container if the locked fractions
     * sum > 1 (overflow-x scrolls), and shrinks proportionally when the
     * window narrows. Columns therefore preserve their relative sizes
     * across resizes without auto-redistributing under the user's feet. */
    let tableContainerWidth = $state(0);

    /** Minimum column width during resize, expressed as a fraction of the
     * table's clientWidth at drag start. Caps tiny columns from collapsing
     * onto themselves. */
    const COLUMN_MIN_FRACTION = 0.04;

    /** Pointer-driven column resize. Captures the table's clientWidth on
     * pointerdown so subsequent drags compute fractions against a stable
     * reference. Writes `tableState.columnWidths[key]` as a fraction (0–1) of
     * that width — applying via CSS `%` keeps the layout responsive when
     * the window/table later resizes. Skipped on `resizable: false`. */
    function startColumnResize(event: PointerEvent, columnKey: string) {
        if (event.button !== 0) return;
        const handle = event.currentTarget as HTMLElement;
        const th = handle.closest('th');
        const table = handle.closest('table');
        const container = handle.closest<HTMLElement>('.table-container');
        if (!th || !table || !container) return;

        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startWidth = th.getBoundingClientRect().width;
        // Fractions are stored against the container's clientWidth — same
        // reference the render uses (`renderedPx = fraction * tableContainerWidth`).
        // Using table.clientWidth here would diverge once the table has
        // already grown past the container.
        const referenceWidth = container.clientWidth || table.clientWidth || startWidth;
        const minWidth = Math.max(1, COLUMN_MIN_FRACTION * referenceWidth);

        // Lock every visible column to its current rendered fraction the
        // first time the user starts a resize. Without locking, applying a
        // pixel/percentage width to just one column lets the browser
        // redistribute the rest based on content — so dragging column A
        // ends up nudging columns B, C and D too. Pinning all columns up
        // front confines the drag to the column the user grabbed; the
        // table itself grows or shrinks horizontally inside its
        // `overflow-x: auto` container.
        const widths: Record<string, number> = { ...tableState.columnWidths };
        const allThs = Array.from(table.querySelectorAll<HTMLElement>('th[data-column-key]'));
        for (const otherTh of allThs) {
            const otherKey = otherTh.dataset.columnKey;
            if (!otherKey || otherKey === columnKey || widths[otherKey] !== undefined) continue;
            const otherWidth = otherTh.getBoundingClientRect().width;
            if (otherWidth > 0 && referenceWidth > 0) {
                widths[otherKey] = otherWidth / referenceWidth;
            }
        }
        tableState.columnWidths = widths;

        let dragged = false;
        try {
            handle.setPointerCapture(event.pointerId);
        } catch {
            // Some browsers throw on synthetic pointer events; the rest of
            // the drag still works without explicit capture.
        }

        const onMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            if (Math.abs(delta) > 2) dragged = true;
            const nextWidth = Math.max(minWidth, startWidth + delta);
            const widths = { ...tableState.columnWidths };
            widths[columnKey] = nextWidth / referenceWidth;
            tableState.columnWidths = widths;
        };

        const onUp = () => {
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            handle.removeEventListener('pointercancel', onUp);
            try {
                handle.releasePointerCapture(event.pointerId);
            } catch {
                // pointer was released by the browser already; ignore
            }
            // After a drag, suppress the trailing click on the <th> that
            // would otherwise toggle sort. Mouseup → click happens once on
            // pointer release, only if the user actually dragged.
            if (dragged) {
                const swallow = (e: MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                };
                handle.addEventListener('click', swallow, { capture: true, once: true });
                // Belt-and-suspenders: some browsers fire click on the <th>
                // ancestor even when capture is on the handle. Swallow there
                // too, removed on the next tick.
                const thSwallow = (e: MouseEvent) => e.stopPropagation();
                th.addEventListener('click', thSwallow, { capture: true, once: true });
                setTimeout(() => th.removeEventListener('click', thSwallow, { capture: true } as EventListenerOptions), 0);
            }
        };

        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
    }

    function isColumnResizable(colProp: { resizable?: boolean } | undefined): boolean {
        if (!colProp) return false;
        return colProp.resizable !== false;
    }

    export function capture(): DataTableState {
        return {
            currentPage: tableState.currentPage,
            searchInput: tableState.searchInput,
            currentOpenIndex: tableState.currentOpenIndex,
            sortColumnKey: tableState.sortColumnKey,
            sortDirection: tableState.sortDirection
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
            tableState.currentPage = snapshot.currentPage ?? 1;
            tableState.searchInput = snapshot.searchInput ?? '';
            tableState.currentOpenIndex = snapshot.currentOpenIndex ?? undefined;
            tableState.sortColumnKey = snapshot.sortColumnKey ?? config.defaultSort?.columnKey;
            tableState.sortDirection = snapshot.sortDirection ?? config.defaultSort?.direction;
            lastObservedSearchInput = tableState.searchInput;
        }
    }

    $effect(() =>
        captureState?.({
            currentPage: tableState.currentPage,
            searchInput: tableState.searchInput,
            currentOpenIndex: tableState.currentOpenIndex,
            sortColumnKey: tableState.sortColumnKey,
            sortDirection: tableState.sortDirection
        })
    );
</script>

<DataTable.Root state={tableState} {searchQuery}>
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
                    <SearchField bind:searchInput={tableState.searchInput} />
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
                        {@const startItemIndex = (tableState.currentPage - 1) * tableState.itemsPerPage + 1}
                        {@const endItemIndex = clamp(
                            tableState.currentPage * tableState.itemsPerPage,
                            tableState.itemsPerPage,
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
                    <DaisyUiDataTablePagination state={tableState} bind:currentPage={tableState.currentPage} {pageAmount} />
                {/if}
                {#if !config.hideSettings}
                    <DaisyUiDataTableSettings state={tableState}>
                        {#if config.itemsPerPageOptions.length > 0}
                            <label class="form-control gap-1">
                                <span class="label-text text-sm font-medium">Items per page</span>
                                <select
                                    class="select select-bordered select-sm"
                                    bind:value={tableState.itemsPerPage}
                                >
                                    {#each config.itemsPerPageOptions as option (option)}
                                        <option value={option}>{option}</option>
                                    {/each}
                                </select>
                            </label>
                        {/if}
                        {#if toggleableColumns.length > 0}
                            <fieldset class="form-control gap-1">
                                <legend class="label-text text-sm font-medium mb-1">Columns</legend>
                                <div class="flex flex-col gap-1">
                                    {#each toggleableColumns as column (column.key)}
                                        <label class="label cursor-pointer justify-start gap-3 py-1">
                                            <input
                                                type="checkbox"
                                                class="checkbox checkbox-sm"
                                                checked={isColumnVisible(column.key)}
                                                onchange={(e) =>
                                                    setColumnVisible(
                                                        column.key,
                                                        (e.currentTarget as HTMLInputElement).checked
                                                    )}
                                            />
                                            <span class="label-text">{column.label}</span>
                                        </label>
                                    {/each}
                                </div>
                            </fieldset>
                        {/if}
                        {#if hasCustomColumnWidths}
                            <button
                                type="button"
                                class="btn btn-ghost btn-sm justify-start"
                                onclick={resetColumnWidths}
                            >
                                Reset column widths
                            </button>
                        {/if}
                        {@render settingsExtra?.()}
                    </DaisyUiDataTableSettings>
                {/if}
            </div>
        </div>

        <div class="table-container overflow-x-auto" bind:clientWidth={tableContainerWidth}>
            <table
                class={[
                    'table',
                    hasCustomColumnWidths ? 'datatable-locked' : 'w-full',
                    {
                        'table-zebra': striped,
                        'table-hover': hoverable,
                        'table-pin-rows': stickyHeader,
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
                    {@const columnEntries = Object.entries(columnProperties)}
                    <thead>
                        <tr>
                            {#each columnEntries as [key, colProp] (key)}
                                {#if !colProp.hidden && isColumnVisible(key)}
                                    {@const userFraction = tableState.columnWidths[key]}
                                    {@const renderedPx =
                                        userFraction !== undefined && tableContainerWidth > 0
                                            ? userFraction * tableContainerWidth
                                            : null}
                                    <th
                                        class="datatable-th whitespace-normal"
                                        class:w-12={key === 'actions' && userFraction === undefined}
                                        style:width={renderedPx !== null ? `${renderedPx.toFixed(2)}px` : null}
                                        style:min-width={renderedPx !== null ? `${renderedPx.toFixed(2)}px` : null}
                                        data-column-key={key}
                                        onclick={() => colProp.sortable && toggleSorting(key)}
                                    >
                                        <div class="flex flex-row items-center">
                                            <span class="mr-2">
                                                {format(`dataTable.${config.type}.${key}.label`)}
                                            </span>
                                            {#if colProp.sortable && items.length > 1}
                                                {#if tableState.sortColumnKey === key && tableState.sortDirection === 'asc'}
                                                    <SortUpIcon />
                                                {:else if tableState.sortColumnKey === key && tableState.sortDirection === 'desc'}
                                                    <SortDownIcon />
                                                {:else}
                                                    <SortIcon />
                                                {/if}
                                            {/if}
                                        </div>
                                        {#if isColumnResizable(colProp)}
                                            <span
                                                role="separator"
                                                aria-orientation="vertical"
                                                aria-label="Resize column {key}"
                                                class="datatable-resize-handle"
                                                onpointerdown={(event) => startColumnResize(event, key)}
                                            ></span>
                                        {/if}
                                    </th>
                                {/if}
                            {/each}
                        </tr>
                    </thead>
                {/if}
                <tbody>
                    {#if queryResult.isError()}
                        <tr>
                            <td colspan={visibleColumnCount} class="datatable-state-cell">
                                {#if errorState}
                                    {@render errorState({ error: queryResult.error })}
                                {:else}
                                    <div role="alert" class="alert alert-error">
                                        <span class="font-medium">Failed to load data:</span>
                                        <span class="opacity-80">{queryResult.error.message}</span>
                                    </div>
                                {/if}
                            </td>
                        </tr>
                    {:else if items.length === 0 && !queryResult.isLoading()}
                        <tr>
                            <td colspan={visibleColumnCount} class="datatable-state-cell">
                                {#if empty}
                                    {@render empty()}
                                {:else}
                                    <div class="text-base-content/60 py-8 text-center">No results.</div>
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        {#each items as item, index (item[config.dataUniquePropertyKey])}
                            <DaisyUiDataRow
                                state={tableState}
                                {item}
                                {index}
                                {open}
                                onClick={config.onItemClick}
                                href={config.buildItemUrl ? config.buildItemUrl(item) : undefined}
                                highlighted={highlightedItemId === item[config.dataUniquePropertyKey]}
                                {customSnippets}
                            />
                        {/each}
                    {/if}
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
                            >{(tableState.currentPage - 1) * tableState.itemsPerPage + 1}
                            - {clamp(tableState.currentPage * tableState.itemsPerPage, tableState.itemsPerPage, itemAmount)} von {itemAmount}</span
                        >
                    {/if}
                    <DaisyUiDataTablePagination state={tableState} bind:currentPage={tableState.currentPage} {pageAmount} />
                </div>
            </div>
        {/if}
    {/snippet}
</DataTable.Root>

<style>
    .table-container {
        width: 100%;
    }

    .table-container :global(td) {
        max-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Empty / error / no-data cells span the full table width and shouldn't
       be cropped by the per-cell ellipsis rule above. */
    .table-container :global(td.datatable-state-cell) {
        max-width: none;
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        width: auto !important;
        text-align: left;
    }

    /* Column-header anchor for the resize handle. Position: relative on the
       <th> would interact badly with sticky-header plans, so we anchor on
       the inner span and let the handle hang past the th's right edge. */
    .table-container :global(th.datatable-th) {
        position: relative;
    }

    /* Once any column has been resized, switch to fixed layout so explicit
       pixel widths on each <th> are respected exactly and the browser stops
       reflowing other columns based on cell content. The table sizes to
       its column widths instead of the container so it can extend past
       `.table-container`'s visible width and trigger horizontal scroll. */
    .table-container :global(table.datatable-locked) {
        table-layout: fixed;
        width: max-content;
        min-width: 100%;
    }

    .table-container :global(.datatable-resize-handle) {
        position: absolute;
        top: 25%;
        right: 0;
        bottom: 25%;
        width: 8px;
        cursor: col-resize;
        user-select: none;
        touch-action: none;
        background: transparent;
        border-right: 2px solid color-mix(in srgb, currentColor 20%, transparent);
        transition: border-color 120ms ease, background 120ms ease;
    }

    .table-container :global(.datatable-resize-handle:hover),
    .table-container :global(.datatable-resize-handle:active) {
        border-right-color: color-mix(in srgb, currentColor 60%, transparent);
        background: color-mix(in srgb, currentColor 10%, transparent);
    }

    .table-container :global(td:last-child) {
        width: 3rem !important;
        padding: 0 !important;
        text-align: center;
    }

    /* Apply the padding to the a tag instead inside the td if it's present */
    .table-lg :global(td:has(> a)) {
        padding-inline: 0;
        padding-block: 0;
    }

    .table-lg :global(td > a) {
        display: block;
        padding-inline: calc(0.25rem * 5);
        padding-block: calc(0.25rem * 4);
    }

    .table-md :global(td:has(> a)) {
        padding-inline: 0;
        padding-block: 0;
    }

    .table-md :global(td > a) {
        display: block;
        padding-inline: calc(0.25rem * 4);
        padding-block: calc(0.25rem * 3);
    }

    .table-sm :global(td:has(> a)) {
        padding-inline: 0;
        padding-block: 0;
    }

    .table-sm :global(td > a) {
        display: block;
        padding-inline: calc(0.25rem * 3);
        padding-block: calc(0.25rem * 2);
    }

    .table-xl :global(td:has(> a)) {
        padding-inline: 0;
        padding-block: 0;
    }

    .table-xl :global(td > a) {
        display: block;
        padding-inline: calc(0.25rem * 6);
        padding-block: calc(0.25rem * 5);
    }

    .table-xs :global(td:has(> a)) {
        padding-inline: 0;
        padding-block: 0;
    }

    .table-xs :global(td > a) {
        display: block;
        padding-inline: calc(0.25rem * 2);
        padding-block: calc(0.25rem * 1);
    }
</style>
