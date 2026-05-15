<script lang="ts">
    import type { DataTableState, InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { IDataSource } from '$lib/dataSource/IDataSource.js';
    import DataTable from '$lib/internal/index.js';
    import { ContextMenuState } from '$lib/internal/contextMenuState.svelte.js';
    import { RowFocusState } from '$lib/internal/rowFocusState.svelte.js';
    import { SelectionState } from '$lib/internal/selectionState.svelte.js';
    import { createPersistedState, createStores, registerNamespaceCollisions } from '$lib/persistence/index.js';
    import type { DataTableConfig, FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import {
        actionRunnerContext,
        configContext,
        contextMenuContext,
        dataSourceContext,
        messageFormatterContext,
        rowActionsColumnEnabledContext,
        rowFocusContext,
        selectionContext,
        selectionEnabledContext,
        type ActionRunner
    } from '$lib/util/context.js';
    import { mergeDataTableConfigDefaults } from '$lib/util/dataTableConfigUtil.js';
    import { clamp } from '$lib/util/generalUtil.js';
    import { createMessageFormatter } from '$lib/util/messageFormatterUtil.svelte.js';
    import { invokeAction, type ActionInvocation } from '$lib/util/invokeAction.js';
    import { extendSelectionRange } from '$lib/util/selectionRangeUtil.js';
    import { matchesShortcut, parseShortcut } from '$lib/util/actionShortcutUtil.js';
    import type { DataTableAction } from '$lib/types/DataTableAction.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import { untrack } from 'svelte';
    import type { Component, Snippet } from 'svelte';
    import { flip } from 'svelte/animate';
    import { box } from 'svelte-toolbelt';
    import type { ClassValue } from 'svelte/elements';
    import { fade } from 'svelte/transition';
    import type { ThemeSize } from '../../routes/util/type/Theme.js';
    import DaisyUiContextMenu from './DaisyUiContextMenu.svelte';
    import DaisyUiDataRow from './DaisyUiDataRow.svelte';
    import DaisyUiDataTableExport from './DaisyUiDataTableExport.svelte';
    import DaisyUiDataTablePagination from './DaisyUiDataTablePagination.svelte';
    import DaisyUiDataTableSettings from './DaisyUiDataTableSettings.svelte';
    import DaisyUiRowActionsHeaderCell from './DaisyUiRowActionsHeaderCell.svelte';
    import DaisyUiSelectionHeaderCell from './DaisyUiSelectionHeaderCell.svelte';
    import DaisyUiSelectionToolbar from './DaisyUiSelectionToolbar.svelte';
    import SearchField from './DaisyUiSearchField.svelte';
    import SortUpIcon from '$lib/daisyUi/icons/SortUpIcon.svelte';
    import SortDownIcon from '$lib/daisyUi/icons/SortDownIcon.svelte';
    import SortIcon from '$lib/daisyUi/icons/SortIcon.svelte';
    import AngleUpIcon from '$lib/daisyUi/icons/AngleUpIcon.svelte';
    import AngleDownIcon from '$lib/daisyUi/icons/AngleDownIcon.svelte';

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
         * Pin the table header row while scrolling. Defaults to `true`,
         * which maps to `'page'`.
         *
         * - `'page'` (or `true`): header pins to the viewport while the
         *   page scrolls. The table-container drops its horizontal
         *   `overflow-x-auto`, so a table wider than the viewport will
         *   cause page-level horizontal scroll instead of inner scroll.
         * - `'container'`: header pins inside `.table-container`. Requires
         *   the caller to height-constrain that container (e.g. a wrapper
         *   with `max-height`); otherwise the page scrolls and the header
         *   travels with it.
         * - `false`: no sticky header.
         */
        stickyHeader?: boolean | 'page' | 'container';

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

        /**
         * Extra menu items rendered above the auto-generated action list
         * inside the right-click / long-press context menu. Use it to
         * splice in app-specific entries (e.g. "Open in new tab",
         * "Copy ID") that don't fit the `DataTableAction` shape.
         *
         * Receives the active invocation — `kind: 'row'` carries the row
         * `item` plus its `id`; `kind: 'bulk'` carries the selected `ids`
         * and the subset currently loaded into the active page. Call
         * `close()` from a click handler to dismiss the menu after acting.
         *
         * Rendered with a divider between the extras and the auto list
         * when both are present; the slot is hidden when the menu has no
         * actions and no extras to show.
         */
        contextMenuExtra?: Snippet<
            [
                {
                    kind: 'row' | 'bulk';
                    item?: Record<string, unknown>;
                    id?: SelectionId;
                    ids: SelectionId[];
                    loadedItems: Record<string, unknown>[];
                    close: () => void;
                }
            ]
        >;

        initialState?: DataTableState;
        captureState?: (state: DataTableState) => void;

        /**
         * Two-way bindable selection. Setting it from outside replaces the
         * internal selection; toggling rows in the table updates this prop.
         * Treat as IDs of `config.dataUniquePropertyKey` — selection persists
         * across pagination, so this can include rows that aren't currently
         * loaded.
         */
        selectedIds?: SelectionId[];

        /**
         * Fired whenever the selection changes (user toggle, programmatic
         * mutation of `selectedIds`, or `clear()`). `loadedItems` is the
         * subset of selected rows that are currently visible on the page —
         * cross-page selections include IDs without loaded items.
         */
        onSelectionChange?: (event: {
            ids: SelectionId[];
            loadedItems: Record<string, unknown>[];
        }) => void;
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
        contextMenuExtra,
        initialState,
        captureState,
        selectedIds = $bindable<SelectionId[]>([]),
        onSelectionChange,
        ...customSnippets
    }: Props = $props();

    const stickyHeaderMode: 'page' | 'container' | false = $derived(
        stickyHeader === true ? 'page' : stickyHeader === false ? false : stickyHeader
    );

    const config: FullDataTableConfig<unknown> = $derived(mergeDataTableConfigDefaults<unknown>(configExport));
    const format: MessageFormatter = $derived(createMessageFormatter<unknown>(config));

    configContext.set(box.with(() => config));
    dataSourceContext.set(box.with(() => dataSource));
    messageFormatterContext.set(box.with(() => format));

    const stores = createStores(config);
    const tableState: InternalDataTableState = createPersistedState(config, initialState, stores);
    registerNamespaceCollisions(config, stores);

    /** Items for the page the data source most recently fetched. Mirrors the
     * `items` exposed by the inner `DataTable.Root` snippet, but read directly
     * from the data source so the SelectionState getter can resolve outside
     * the snippet body. */
    const currentPageItems = $derived(
        (dataSource.queryResult.data?.items ?? []) as Record<string, unknown>[]
    );

    /** Single SelectionState instance for the lifetime of the table. Always
     * created — selection UI rendering is gated separately by
     * `selectionEnabled` so a dormant store carries no per-row cost. The
     * initial set is seeded from the bindable `selectedIds` prop so a
     * consumer-provided default selection survives the first paint. */
    const selection = new SelectionState<Record<string, unknown>>({
        initial: selectedIds,
        getKey: (item) => item[config.dataUniquePropertyKey] as string | number,
        getCurrentPageItems: () => currentPageItems,
        isRowSelectable: (item) => config.selection.selectableRows?.(item) ?? true
    });

    /** Whether the selection chrome (checkbox column, row-actions column,
     * bulk toolbar) should render. True when the consumer registered any
     * actions or explicitly opted in via `selection.enabled`. */
    const selectionEnabled = $derived(
        config.selection.enabled === true || config.actions.length > 0
    );

    /** Equality check that ignores order — selection identity is set-like
     * even though the bindable prop is an array. Used by the sync effects
     * below to short-circuit no-op updates and prevent ping-pong. */
    function idsEqual(a: readonly SelectionId[], b: readonly SelectionId[]): boolean {
        if (a === b) return true;
        if (a.length !== b.length) return false;
        const set = new Set(a);
        for (const id of b) if (!set.has(id)) return false;
        return true;
    }

    /** External → internal: consumer mutates `selectedIds` (or it's seeded
     * with a non-empty default) → mirror into the internal SelectionState.
     * Reads only `selectedIds`; the apply happens inside `untrack` so writes
     * to the SelectionSet don't immediately re-fire this effect. */
    $effect(() => {
        const externalIds = selectedIds;
        untrack(() => {
            if (!idsEqual(selection.ids, externalIds)) {
                selection.replaceAll(externalIds);
            }
        });
    });

    /** Internal → external: user toggles a row, or `clear()` runs after a
     * bulk action → mirror back into the bindable prop and emit
     * `onSelectionChange`. Reads only `selection.ids` and reuses `untrack`
     * for the writes for the same anti-ping-pong reason. */
    $effect(() => {
        const internalIds = selection.ids;
        untrack(() => {
            if (idsEqual(selectedIds, internalIds)) return;
            selectedIds = internalIds;
            if (onSelectionChange) {
                const idSet = new Set(internalIds);
                const loadedItems = currentPageItems.filter((item) =>
                    idSet.has(item[config.dataUniquePropertyKey] as SelectionId)
                );
                onSelectionChange({ ids: internalIds, loadedItems });
            }
        });
    });

    /** Whether the trailing three-dot row-actions column should render. True
     * iff at least one action contributes a row-context handler (onSingle
     * or onMulti) and the consumer hasn't opted out via
     * `selection.hideRowActionsColumn`. */
    const rowActionsColumnEnabled = $derived(
        !config.selection.hideRowActionsColumn &&
            config.actions.some(
                (action) =>
                    !action.hideInRow && (action.onSingle !== undefined || action.onMulti !== undefined)
            )
    );

    /** Bumped to trigger a re-fetch of the current page. The internal table
     * tracks this in `refresh()` so an increment forces the effect to
     * re-run. Used by the action runner for `refreshAfter` actions. */
    let refreshNonce = $state(0);

    const actionRunner: ActionRunner = {
        invoke(action, invocation) {
            return invokeAction({
                action: action as DataTableAction<Record<string, unknown>>,
                invocation: invocation as ActionInvocation<Record<string, unknown>>,
                selection,
                refresh: () => {
                    refreshNonce++;
                }
            });
        }
    };

    selectionContext.set(box.with(() => selection as SelectionState<unknown>));
    selectionEnabledContext.set(box.with(() => selectionEnabled));
    rowActionsColumnEnabledContext.set(box.with(() => rowActionsColumnEnabled));
    actionRunnerContext.set(box.with(() => actionRunner));

    /** Roving-tabindex focus tracker. One instance per table, exposed via
     * context so `DaisyUiDataRow` can read the focused index without prop
     * drilling. Lives outside the snippet so it survives re-renders driven
     * by data-source updates. */
    const rowFocus = new RowFocusState();
    rowFocusContext.set(box.with(() => rowFocus));

    /** Single right-click / long-press context menu for this table. The
     * `<DaisyUiContextMenu />` component below subscribes via context;
     * rows publish open events via the same context. */
    const contextMenu = new ContextMenuState<Record<string, unknown>>();
    contextMenuContext.set(
        box.with(() => contextMenu as ContextMenuState<unknown>)
    );

    /** Reset the focused row whenever the visible page changes — otherwise
     * paginating from page 3 with row 8 focused would land on page 4 with
     * stale focus past the new items array. Reads `currentPage` and the
     * length of the items array; `untrack` on the reset itself keeps the
     * effect a one-way listener. */
    $effect(() => {
        tableState.currentPage;
        currentPageItems.length;
        untrack(() => rowFocus.reset());
    });

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

    /** Active table density. Persistent state wins over the `size` prop, so a
     * user choice in the settings popover overrides the consumer's default. */
    const effectiveDensity = $derived<NonNullable<ThemeSize>>(tableState.density ?? size);

    /** Ordered list of column keys to render. Resolved by overlaying
     * `state.columnOrder` on top of the config-defined order: known keys come
     * first in user-chosen order, then any keys missing from the persisted
     * order (newly-added columns) trail in their config-order position. */
    const orderedColumnKeys = $derived.by(() => {
        const configKeys = Object.keys(config.columnProperties);
        if (!tableState.columnOrder.length) return configKeys;
        const configKeySet = new Set(configKeys);
        const seen = new Set<string>();
        const ordered: string[] = [];
        for (const key of tableState.columnOrder) {
            if (configKeySet.has(key) && !seen.has(key)) {
                ordered.push(key);
                seen.add(key);
            }
        }
        for (const key of configKeys) {
            if (!seen.has(key)) ordered.push(key);
        }
        return ordered;
    });

    /**
     * One-based index of `key` in the active multi-sort (primary = 1,
     * tiebreakers count up). Returns `0` when the column isn't part of any
     * sort. Used to render the small priority badge next to the sort caret.
     */
    function sortPriorityFor(key: string): number {
        if (tableState.sortColumnKey === key && tableState.sortDirection) return 1;
        const idx = tableState.additionalSort.findIndex((entry) => entry.column === key);
        return idx >= 0 ? idx + 2 : 0;
    }

    /** Sort direction for any column in the active sort, or `false` if not. */
    function sortDirectionFor(key: string): 'asc' | 'desc' | false {
        if (tableState.sortColumnKey === key && tableState.sortDirection) return tableState.sortDirection;
        const entry = tableState.additionalSort.find((entry) => entry.column === key);
        return entry ? entry.direction : false;
    }

    /** Move a column up or down in the persisted order. Operates on the
     * resolved `orderedColumnKeys` (which already merges config + persisted
     * order) so reorder buttons in the settings popover stay correct even
     * before the user has explicitly set any order. */
    function moveColumn(key: string, delta: -1 | 1): void {
        const order = [...orderedColumnKeys];
        const idx = order.indexOf(key);
        const target = idx + delta;
        if (idx < 0 || target < 0 || target >= order.length) return;
        [order[idx], order[target]] = [order[target], order[idx]];
        tableState.columnOrder = order;
    }

    function resetColumnOrder(): void {
        tableState.columnOrder = [];
    }

    /**
     * Derived list of columns the user is allowed to toggle in the settings
     * popover. Skips permanently-hidden config columns and any column marked
     * `alwaysVisible`. Each entry resolves the column's display label via the
     * configured message formatter.
     */
    const toggleableColumns = $derived(
        orderedColumnKeys
            .map((key) => ({ key, colProp: config.columnProperties[key] }))
            .filter(({ colProp }) => colProp && !colProp.hidden && !colProp.alwaysVisible)
            .map(({ key }) => ({
                key,
                label: format(`dataTable.${config.type}.${key}.label`)
            }))
    );

    /** Reorderable column entries for the settings popover. Includes hidden
     * columns (so users can reorder + reveal them) but skips columns marked
     * permanently hidden via `colProp.hidden`. */
    const reorderableColumns = $derived(
        orderedColumnKeys
            .map((key, index) => ({ key, index, colProp: config.columnProperties[key] }))
            .filter(({ colProp }) => colProp && !colProp.hidden)
            .map(({ key, index }) => ({
                key,
                index,
                label: format(`dataTable.${config.type}.${key}.label`)
            }))
    );

    /** True when the user has reordered at least one column. Drives the
     * "Reset column order" button's visibility in the settings popover. */
    const hasCustomColumnOrder = $derived(tableState.columnOrder.length > 0);

    /** Ordered keys that should actually render as <th>s. Pre-filtered so
     * the each-block in the header can carry an `animate:flip` directly on
     * the <th> — Svelte requires the animated element to be the only child
     * of a keyed `{#each}`, which precludes wrapping it in an `{#if}`. */
    const visibleOrderedColumnKeys = $derived(
        orderedColumnKeys.filter((key) => {
            const colProp = config.columnProperties[key];
            return colProp && !colProp.hidden && isColumnVisible(key);
        })
    );

    /** Number of <th>s actually rendered, used for state-row colspan.
     * Includes the leading selection column and trailing row-actions column
     * when active so the empty/error rows still span the entire table. */
    const visibleColumnCount = $derived(
        visibleOrderedColumnKeys.length +
            (selectionEnabled ? 1 : 0) +
            (rowActionsColumnEnabled ? 1 : 0)
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
            sortDirection: tableState.sortDirection,
            additionalSort: tableState.additionalSort
        };
    }

    export function restore(snapshot: DataTableState | undefined) {
        if (
            snapshot &&
            ((snapshot.currentPage && snapshot.currentPage !== 1) ||
                snapshot.searchInput ||
                snapshot.currentOpenIndex !== undefined ||
                snapshot.sortColumnKey !== config.defaultSort?.columnKey ||
                snapshot.sortDirection !== config.defaultSort?.direction ||
                (snapshot.additionalSort && snapshot.additionalSort.length > 0))
        ) {
            tableState.currentPage = snapshot.currentPage ?? 1;
            tableState.searchInput = snapshot.searchInput ?? '';
            tableState.currentOpenIndex = snapshot.currentOpenIndex ?? undefined;
            tableState.sortColumnKey = snapshot.sortColumnKey ?? config.defaultSort?.columnKey;
            tableState.sortDirection = snapshot.sortDirection ?? config.defaultSort?.direction;
            tableState.additionalSort = snapshot.additionalSort ?? [];
            lastObservedSearchInput = tableState.searchInput;
        }
    }

    $effect(() =>
        captureState?.({
            currentPage: tableState.currentPage,
            searchInput: tableState.searchInput,
            currentOpenIndex: tableState.currentOpenIndex,
            sortColumnKey: tableState.sortColumnKey,
            sortDirection: tableState.sortDirection,
            additionalSort: tableState.additionalSort
        })
    );

    /**
     * Roving-tabindex keyboard handler. Wired to the <table> element inside
     * the snippet so it has access to the live items array, total page
     * count, and modal-toggle callback without prop-drilling them through
     * context. Plain rows handle arrow / Home / End / PageUp / PageDown
     * navigation, plus Space (toggle selection), Shift+Space (extend
     * selection from anchor), and Enter (default action). Typing into a
     * cell-embedded input or contenteditable falls through to default
     * behaviour.
     */
    function handleTableKeydown(
        event: KeyboardEvent,
        items: readonly Record<string, unknown>[],
        pageCount: number,
        open: (index: number) => void
    ): void {
        const total = items.length;
        if (total <= 0) return;
        const target = event.target as HTMLElement | null;
        if (!target) return;
        // Don't steal keys from text-entry widgets nested inside cells.
        if (target.closest('input, textarea, select, [contenteditable="true"]')) return;

        switch (event.key) {
            case 'ArrowDown':
                rowFocus.move(1, total);
                event.preventDefault();
                return;
            case 'ArrowUp':
                rowFocus.move(-1, total);
                event.preventDefault();
                return;
            case 'Home':
                rowFocus.setIndex(0, total);
                event.preventDefault();
                return;
            case 'End':
                rowFocus.setIndex(total - 1, total);
                event.preventDefault();
                return;
            case 'PageDown':
                if (pageCount > 0 && tableState.currentPage < pageCount) {
                    tableState.currentPage += 1;
                    event.preventDefault();
                }
                return;
            case 'PageUp':
                if (tableState.currentPage > 1) {
                    tableState.currentPage -= 1;
                    event.preventDefault();
                }
                return;
            case ' ':
                if (!selectionEnabled) return;
                if (event.shiftKey) {
                    extendSelectionFromAnchor(items);
                } else {
                    toggleSelectionAtFocus(items);
                }
                event.preventDefault();
                return;
            case 'Enter':
                triggerDefaultAction(items, open, target);
                event.preventDefault();
                return;
        }

        if (dispatchActionShortcut(event, items)) return;
    }

    /** Match the keydown event against `config.actions[].shortcut`.
     * First-match-wins (config-array order). Returns `true` when an action
     * was dispatched (or matched-but-disabled and silently swallowed) so
     * the caller knows the event was consumed. Run after the built-in
     * keys above so reserved navigation keys always win. */
    function dispatchActionShortcut(
        event: KeyboardEvent,
        items: readonly Record<string, unknown>[]
    ): boolean {
        const actions = config.actions as DataTableAction<Record<string, unknown>>[];
        for (const action of actions) {
            if (!action.shortcut) continue;
            let parsed;
            try {
                parsed = parseShortcut(action.shortcut);
            } catch {
                continue;
            }
            if (!matchesShortcut(event, parsed)) continue;

            const useBulk = selection.count > 1 && action.onMulti !== undefined;
            if (useBulk) {
                const ids = selection.ids;
                const idSet = new Set(ids);
                const loadedItems = items.filter((row) =>
                    idSet.has(row[config.dataUniquePropertyKey] as SelectionId)
                );
                const reason = action.isDisabled?.({ kind: 'bulk', ids, loadedItems }) ?? false;
                event.preventDefault();
                if (reason !== false) return true;
                void actionRunner.invoke(action, { kind: 'bulk', ids });
                return true;
            }

            const item = items[rowFocus.focusedIndex];
            if (!item) return false;
            if (!action.onSingle && !action.onMulti) return false;
            const id = item[config.dataUniquePropertyKey] as SelectionId;
            const reason = action.isDisabled?.({ kind: 'row', item }) ?? false;
            event.preventDefault();
            if (reason !== false) return true;
            void actionRunner.invoke(action, { kind: 'row', item, id });
            return true;
        }
        return false;
    }

    /** Toggle selection on the focused row + reset the Shift-anchor to it.
     * Mirrors a plain checkbox click. No-op for rows the consumer marked
     * non-selectable via `selection.selectableRows`. */
    function toggleSelectionAtFocus(items: readonly Record<string, unknown>[]): void {
        const item = items[rowFocus.focusedIndex];
        if (!item) return;
        if (!selection.isItemSelectable(item)) return;
        const id = item[config.dataUniquePropertyKey] as SelectionId;
        selection.toggle(id);
        rowFocus.anchor = rowFocus.focusedIndex;
    }

    /** Additive range select from the Shift-anchor to the focused row. The
     * anchor is set on plain Space (above) and on plain row clicks; if no
     * anchor exists yet (consumer just landed via Tab/Arrow) the focused
     * row alone is toggled instead. Off-page selections are preserved. */
    function extendSelectionFromAnchor(items: readonly Record<string, unknown>[]): void {
        if (rowFocus.anchor === null) {
            toggleSelectionAtFocus(items);
            return;
        }
        extendSelectionRange(
            selection,
            items,
            rowFocus.anchor,
            rowFocus.focusedIndex,
            config.dataUniquePropertyKey
        );
    }

    /** Enter on a focused row — the keyboard equivalent of a row click.
     * Mirrors `onItemClick` > `modalComponent` > `buildItemUrl` priority
     * used by `InternalDataRow.rowOnClick` (cases 1-2) and the cell-level
     * `<a href>` wrapping (case 3). For the link case we click the first
     * `<a href>` inside the row so Ctrl/Meta-Enter routes through the same
     * browser handling as Ctrl/Meta-click. */
    function triggerDefaultAction(
        items: readonly Record<string, unknown>[],
        open: (index: number) => void,
        target: HTMLElement
    ): void {
        const item = items[rowFocus.focusedIndex];
        if (!item) return;
        // FullDataTableConfig types these as required because they hang off
        // `Required<…>`, but `mergeDataTableConfigDefaults` actually leaves
        // them undefined when the consumer doesn't supply them — so the
        // truthy checks below need an explicit cast to be honest about the
        // runtime shape.
        const onItemClick = config.onItemClick as ((item: unknown) => void) | undefined;
        const modalComponent = config.modalComponent as unknown;
        const buildItemUrl = config.buildItemUrl as ((item: unknown) => string) | undefined;
        if (onItemClick) {
            onItemClick(item);
            return;
        }
        if (modalComponent) {
            const isCurrentlyOpen = tableState.currentOpenIndex === rowFocus.focusedIndex;
            open(isCurrentlyOpen ? -1 : rowFocus.focusedIndex);
            return;
        }
        if (buildItemUrl) {
            const row = target.closest<HTMLTableRowElement>('tr.datatable-row');
            const link = row?.querySelector<HTMLAnchorElement>('a[href]');
            if (link) {
                link.click();
            } else {
                window.location.assign(buildItemUrl(item));
            }
        }
    }
</script>

<DataTable.Root state={tableState} {searchQuery} {refreshNonce}>
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
            <div class="flex flex-row flex-wrap items-center gap-3">
                {@render headerFirst?.()}
                {#if config.enableSearch}
                    <SearchField bind:searchInput={tableState.searchInput} />
                {/if}
                {#if selectionEnabled}
                    <DaisyUiSelectionToolbar />
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

                        <span class="text-base-content/80 whitespace-nowrap text-sm md:text-base">
                            {startItemIndex}-{endItemIndex}
                            <span class="hidden md:inline">von</span><span class="md:hidden">/</span>
                            {itemAmount}
                        </span>
                    {:else}
                        <span class="text-base-content/80 whitespace-nowrap text-sm md:text-base">
                            0-0
                            <span class="hidden md:inline">von</span><span class="md:hidden">/</span>
                            {Math.max(0, itemAmount)}
                        </span>
                    {/if}
                    <DaisyUiDataTablePagination state={tableState} bind:currentPage={tableState.currentPage} {pageAmount} />
                {/if}
                {#if config.resolvedExporters.length > 0 || !config.hideSettings}
                    {@const exportShown = config.resolvedExporters.length > 0}
                    {@const settingsShown = !config.hideSettings}
                    {@const joinPair = exportShown && settingsShown}
                    {@const joinClass = 'btn btn-ghost btn-sm btn-square join-item'}
                    <div class={joinPair ? 'join' : 'contents'}>
                        {#if exportShown}
                            <DaisyUiDataTableExport
                                {tableState}
                                {visibleOrderedColumnKeys}
                                {searchQuery}
                                {stores}
                                triggerClass={joinPair ? joinClass : undefined}
                            />
                        {/if}
                        {#if settingsShown}
                            <DaisyUiDataTableSettings
                                state={tableState}
                                triggerClass={joinPair ? joinClass : undefined}
                            >
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
                        <label class="form-control gap-1">
                            <span class="label-text text-sm font-medium">Density</span>
                            <select
                                class="select select-bordered select-sm"
                                aria-label="Table density"
                                value={tableState.density ?? ''}
                                onchange={(e) => {
                                    const v = (e.currentTarget as HTMLSelectElement).value;
                                    tableState.density = v === '' ? undefined : (v as 'xs' | 'md' | 'lg');
                                }}
                            >
                                <option value="xs">Compact</option>
                                <option value="">Default</option>
                                <option value="lg">Spacious</option>
                            </select>
                        </label>
                        {#if reorderableColumns.length > 0}
                            <fieldset class="form-control gap-1">
                                <legend class="label-text text-sm font-medium mb-1">Columns</legend>
                                <ul class="datatable-column-list flex flex-col gap-1">
                                    {#each reorderableColumns as column, listIndex (column.key)}
                                        {@const isFirst = listIndex === 0}
                                        {@const isLast = listIndex === reorderableColumns.length - 1}
                                        {@const reorderJoined = !isFirst && !isLast}
                                        {@const colProp = config.columnProperties[column.key]}
                                        {@const togglable = colProp && !colProp.alwaysVisible}
                                        <li
                                            class="datatable-column-list-item flex items-center gap-2 py-1"
                                            animate:flip={{ duration: 200 }}
                                        >
                                            <label class="label cursor-pointer justify-start gap-2 flex-1 py-0">
                                                {#if togglable}
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
                                                {:else}
                                                    <span class="datatable-column-locked w-4 h-4" aria-hidden="true"></span>
                                                {/if}
                                                <span class="label-text">{column.label}</span>
                                            </label>
                                            <div class={[reorderJoined ? 'join' : 'flex', 'justify-end']}>
                                                <button
                                                    type="button"
                                                    class={['btn btn-ghost btn-xs', reorderJoined && 'join-item']}
                                                    aria-label="Move {column.label} up"
                                                    disabled={isFirst}
                                                    onclick={() => moveColumn(column.key, -1)}
                                                >
                                                    <AngleUpIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    class={['btn btn-ghost btn-xs', reorderJoined && 'join-item']}
                                                    aria-label="Move {column.label} down"
                                                    disabled={isLast}
                                                    onclick={() => moveColumn(column.key, 1)}
                                                >
                                                    <AngleDownIcon />
                                                </button>
                                            </div>
                                        </li>
                                    {/each}
                                </ul>
                            </fieldset>
                        {/if}
                        {#if hasCustomColumnOrder}
                            <button
                                type="button"
                                class="btn btn-ghost btn-sm justify-start"
                                onclick={resetColumnOrder}
                            >
                                Reset column order
                            </button>
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
                {/if}
            </div>
        </div>

        <div
            class={['table-container', { 'overflow-x-auto': stickyHeaderMode !== 'page' }]}
            bind:clientWidth={tableContainerWidth}
        >
            <table
                class={[
                    'table',
                    hasCustomColumnWidths ? 'datatable-locked' : 'w-full',
                    {
                        'table-zebra': striped,
                        'table-hover': hoverable,
                        'table-pin-rows': stickyHeaderMode !== false,
                        'table-xs': effectiveDensity === 'xs',
                        'table-sm': effectiveDensity === 'sm',
                        'table-md': effectiveDensity === 'md',
                        'table-lg': effectiveDensity === 'lg',
                        'table-xl': effectiveDensity === 'xl'
                    },
                    classExport
                ]}
                onkeydown={(event) =>
                    handleTableKeydown(
                        event,
                        items as readonly Record<string, unknown>[],
                        pageAmount,
                        open
                    )}
            >
                {#if config.showTableHeader}
                    <thead>
                        <tr>
                            {#if selectionEnabled}
                                <DaisyUiSelectionHeaderCell />
                            {/if}
                            {#each visibleOrderedColumnKeys as key (key)}
                                {@const colProp = columnProperties[key]}
                                {@const userFraction = tableState.columnWidths[key]}
                                {@const renderedPx =
                                    userFraction !== undefined && tableContainerWidth > 0
                                        ? userFraction * tableContainerWidth
                                        : null}
                                {@const sortDir = sortDirectionFor(key)}
                                {@const sortPriority = sortPriorityFor(key)}
                                <th
                                    class="datatable-th whitespace-normal"
                                    class:w-12={key === 'actions' && userFraction === undefined}
                                    style:width={renderedPx !== null ? `${renderedPx.toFixed(2)}px` : null}
                                    style:min-width={renderedPx !== null ? `${renderedPx.toFixed(2)}px` : null}
                                    data-column-key={key}
                                    animate:flip={{ duration: 200 }}
                                    onclick={(event) =>
                                        colProp.sortable && toggleSorting(key, event.shiftKey)}
                                >
                                    <div class="flex flex-row items-center">
                                        <span class="mr-2">
                                            {format(`dataTable.${config.type}.${key}.label`)}
                                        </span>
                                        {#if colProp.sortable && items.length > 1}
                                            {#if sortDir === 'asc'}
                                                <SortUpIcon />
                                            {:else if sortDir === 'desc'}
                                                <SortDownIcon />
                                            {:else}
                                                <SortIcon />
                                            {/if}
                                            {#if sortPriority > 0 && (tableState.additionalSort.length > 0 || sortPriority > 1)}
                                                <span
                                                    class="datatable-sort-priority badge badge-xs ml-1"
                                                    aria-label="Sort priority {sortPriority}"
                                                >
                                                    {sortPriority}
                                                </span>
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
                            {/each}
                            {#if rowActionsColumnEnabled}
                                <DaisyUiRowActionsHeaderCell />
                            {/if}
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
                                tableState={tableState}
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
            <div class="mt-3 flex flex-wrap items-center justify-between" transition:fade|local={{ duration: 200 }}>
                <div>
                    {#if queryResult.isLoading()}
                        <span class="loading loading-spinner"></span>
                    {/if}
                </div>
                <div class="flex flex-row items-baseline">
                    {#if itemAmount >= 0}
                        <span class="text-base-content/80 mr-3 whitespace-nowrap text-sm md:text-base">
                            {(tableState.currentPage - 1) * tableState.itemsPerPage + 1}-{clamp(
                                tableState.currentPage * tableState.itemsPerPage,
                                tableState.itemsPerPage,
                                itemAmount
                            )}
                            <span class="hidden md:inline">von</span><span class="md:hidden">/</span>
                            {itemAmount}
                        </span>
                    {/if}
                    <DaisyUiDataTablePagination state={tableState} bind:currentPage={tableState.currentPage} {pageAmount} />
                </div>
            </div>
        {/if}
    {/snippet}
</DataTable.Root>

<DaisyUiContextMenu extra={contextMenuExtra} />

<style>
    .table-container {
        width: 100%;
    }

    /* Roving-tabindex focus ring on the focused row. `outline-offset: -2px`
       keeps the ring inside the row's bounding box so the surrounding
       padding doesn't shift the layout when focus moves. Only applied for
       keyboard focus to keep mouse interactions visually unchanged. */
    .table-container :global(tr.datatable-row:focus-visible) {
        outline: 2px solid var(--color-primary, currentColor);
        outline-offset: -2px;
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

    /* Multi-sort priority badge — small monospace pill next to the caret so
       users can see the sort order across columns at a glance. Hidden in
       single-column-sort mode (priority 1, no tiebreakers) to keep the
       common case visually quiet. */
    .table-container :global(.datatable-sort-priority) {
        font-variant-numeric: tabular-nums;
        font-size: 0.625rem;
        padding-inline: 0.3rem;
        line-height: 1;
    }

    /* Reorder list inside the settings popover. Keeps a fixed left gutter for
       the up/down arrows so labels align across rows of varying length. */
    :global(.datatable-column-list-item) {
        min-height: 2.5rem;
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
