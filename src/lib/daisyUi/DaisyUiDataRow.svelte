<script lang="ts">
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import DataTable from '$lib/internal/index.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import {
        configContext,
        contextMenuContext,
        dataSourceContext,
        rowActionsColumnEnabledContext,
        rowFocusContext,
        selectionContext,
        selectionEnabledContext
    } from '$lib/util/context.js';
    import { tick } from 'svelte';
    import { flip } from 'svelte/animate';
    import { slide } from 'svelte/transition';
    import DaisyUiBadgeWrapper from '$lib/daisyUi/DaisyUiBadgeWrapper.svelte';
    import DaisyUiIconWrapper from '$lib/daisyUi/DaisyUiIconWrapper.svelte';
    import DaisyUiRowActionsCell from '$lib/daisyUi/DaisyUiRowActionsCell.svelte';
    import DaisyUiSelectionCell from '$lib/daisyUi/DaisyUiSelectionCell.svelte';

    const config = $derived(configContext.get().current);
    const selectionEnabled = $derived(selectionEnabledContext.get().current);
    const rowActionsColumnEnabled = $derived(rowActionsColumnEnabledContext.get().current);
    const rowFocus = $derived(rowFocusContext.get().current);
    const selection = $derived(selectionContext.get().current);
    const contextMenu = $derived(contextMenuContext.get().current);
    const dataSource = $derived(dataSourceContext.get().current);

    interface Props {
        tableState: InternalDataTableState;
        index: number;
        highlighted: boolean;
        onClick: (<T>(item: T) => void | Promise<void>) | undefined;
        href: string | undefined;
        item: Record<string, unknown>;
        open: (index: number) => void;

        customSnippets: CustomSnippetProps;
    }

    let { tableState, index, highlighted, onClick, href, item, open, customSnippets }: Props = $props();

    /** This row holds the keyboard focus when its index matches the
     * RowFocusState's. Drives both `tabindex` (roving pattern: 0 for
     * focused, -1 for the rest) and the focus-pull effect below. */
    const isFocused = $derived(rowFocus.focusedIndex === index);

    let rowEl = $state<HTMLTableRowElement | undefined>(undefined);

    /** When the focused index changes (arrow keys, Home/End, page change)
     * pull the DOM focus onto the matching row so the next keystroke lands
     * here. The activeElement guard prevents focus thrash when the user
     * deliberately tabbed into a cell-embedded control inside this row. */
    $effect(() => {
        if (!isFocused || !rowEl) return;
        if (document.activeElement === rowEl) return;
        if (rowEl.contains(document.activeElement)) return;
        // Wait for any pending DOM mutations (e.g. a page change re-rendered
        // the tbody) before focusing — otherwise focus() can hit a stale node.
        void tick().then(() => {
            if (rowEl && rowFocus.focusedIndex === index) {
                rowEl.focus({ preventScroll: false });
            }
        });
    });

    /**
     * Open the shared context menu at the supplied viewport coordinates,
     * applying the OS-file-explorer selection rules:
     *
     * - If selection chrome is on and this row isn't selected, replace the
     *   selection with this row first.
     * - If it *is* selected and other rows are too (count > 1), open the
     *   bulk variant — preserving the existing multi-selection so the
     *   action operates on the whole set.
     * - Otherwise the row variant opens with this row's `item` payload.
     */
    function openContextMenuAt(clientX: number, clientY: number): void {
        if (!item) return;
        const id = item[config.dataUniquePropertyKey] as SelectionId;
        const wasInSelection = selectionEnabled && selection.has(id);
        if (selectionEnabled && !wasInSelection) {
            selection.replaceAll([id]);
            rowFocus.anchor = index;
        }
        rowFocus.focusedIndex = index;

        if (wasInSelection && selection.count > 1) {
            const ids = selection.ids;
            const idSet = new Set(ids);
            const pageItems = (dataSource.queryResult.data?.items ?? []) as Record<
                string,
                unknown
            >[];
            const loadedItems = pageItems.filter((row) =>
                idSet.has(row[config.dataUniquePropertyKey] as SelectionId)
            );
            contextMenu.show(clientX, clientY, {
                kind: 'bulk',
                ids,
                loadedItems
            });
            return;
        }

        contextMenu.show(clientX, clientY, { kind: 'row', item, id });
    }

    /** Right-click handler — keeps the desktop-mouse path simple. The
     * heavy lifting lives in `openContextMenuAt`, shared with the touch
     * long-press path below. */
    function onContextMenu(event: MouseEvent): void {
        event.preventDefault();
        openContextMenuAt(event.clientX, event.clientY);
    }

    /**
     * Touch long-press detection. Touch devices have no native right-click
     * — a 500 ms hold opens the same context menu instead. Cancelled by:
     *
     * - the pointer moving more than ~10 px (a scroll/swipe gesture),
     * - the pointer being released before the timer fires,
     * - pointercancel from the OS (interrupted gesture, app switch, …).
     *
     * Suppresses the synthetic `contextmenu` event Android fires after a
     * long-press so the row's `oncontextmenu` doesn't double-open the menu.
     */
    const LONG_PRESS_MS = 500;
    const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let longPressStart: { x: number; y: number; pointerId: number } | null = null;
    let longPressFired = false;

    function cancelLongPress(): void {
        if (longPressTimer !== null) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        longPressStart = null;
    }

    function onPointerDownLongPress(event: PointerEvent): void {
        if (event.pointerType !== 'touch') return;
        cancelLongPress();
        longPressFired = false;
        longPressStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            if (!longPressStart) return;
            const { x, y } = longPressStart;
            longPressFired = true;
            longPressStart = null;
            openContextMenuAt(x, y);
        }, LONG_PRESS_MS);
    }

    function onPointerMoveLongPress(event: PointerEvent): void {
        if (!longPressStart || event.pointerId !== longPressStart.pointerId) return;
        const dx = event.clientX - longPressStart.x;
        const dy = event.clientY - longPressStart.y;
        if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_THRESHOLD_PX) {
            cancelLongPress();
        }
    }

    function onPointerEndLongPress(): void {
        cancelLongPress();
    }

    function onContextMenuFromTouch(event: MouseEvent): boolean {
        // After a fired long-press, swallow the synthetic contextmenu so we
        // don't open the menu twice in a row.
        if (longPressFired) {
            longPressFired = false;
            event.preventDefault();
            return false;
        }
        return true;
    }

    /** Resolved column order (user-chosen overlaid on config order), then
     * filtered by visibility. Mirrors the header's iteration so the cell
     * order, count, and identity all line up. */
    const visibleColumnEntries = $derived.by(() => {
        const configKeys = Object.keys(config.columnProperties);
        const ordered: string[] = [];
        if (tableState.columnOrder.length) {
            const configKeySet = new Set(configKeys);
            const seen = new Set<string>();
            for (const key of tableState.columnOrder) {
                if (configKeySet.has(key) && !seen.has(key)) {
                    ordered.push(key);
                    seen.add(key);
                }
            }
            for (const key of configKeys) {
                if (!seen.has(key)) ordered.push(key);
            }
        } else {
            ordered.push(...configKeys);
        }
        return ordered
            .map((key) => [key, config.columnProperties[key]] as const)
            .filter(([key, colProp]) => !colProp?.hidden && tableState.columnVisibility[key] !== false);
    });
    /** Spans the data columns plus the leading selection column and trailing
     * row-actions column when active. Used for the colspans of the
     * open-modal margin/content rows so they stretch across the same width
     * as the data row. */
    const columnCount = $derived(
        visibleColumnEntries.length +
            (selectionEnabled ? 1 : 0) +
            (rowActionsColumnEnabled ? 1 : 0)
    );
</script>

<DataTable.Row state={tableState} {index} {onClick} {item} {open}>
    {#snippet children({ isOpen, rowOnClick, toggle })}
        {#if isOpen}
            <tr class="margin-row top border-b-0">
                <td colspan={columnCount} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
        <tr
            bind:this={rowEl}
            class={[
                'datatable-row cursor-pointer whitespace-nowrap transition-colors duration-200',
                {
                    'bg-base-300': highlighted,
                    'border-0 rounded-t-box': isOpen
                }
            ]}
            class:expanded={isOpen}
            class:highlighted
            tabindex={isFocused ? 0 : -1}
            onclick={rowOnClick}
            oncontextmenu={(event) => {
                if (!onContextMenuFromTouch(event)) return;
                onContextMenu(event);
            }}
            onfocus={() => {
                rowFocus.focusedIndex = index;
            }}
            onpointerdown={(event) => {
                rowFocus.focusedIndex = index;
                rowFocus.anchor = index;
                onPointerDownLongPress(event);
            }}
            onpointermove={onPointerMoveLongPress}
            onpointerup={onPointerEndLongPress}
            onpointercancel={onPointerEndLongPress}
            onpointerleave={onPointerEndLongPress}
        >
            {#if item}
                {#if selectionEnabled}
                    <DaisyUiSelectionCell {item} />
                {/if}
                {#each visibleColumnEntries as [key, _colProp] (key)}
                    <td
                        class={[isOpen && 'bg-base-300 border-0 first:rounded-tl-box last:rounded-tr-box']}
                        animate:flip={{ duration: 200 }}
                    >
                        {#if href}
                            <a {href}>
                                <DataTable.Column
                                    IconComponent={DaisyUiIconWrapper}
                                    BadgeComponent={DaisyUiBadgeWrapper}
                                    {item}
                                    {key}
                                    {customSnippets}
                                />
                            </a>
                        {:else}
                            <DataTable.Column
                                IconComponent={DaisyUiIconWrapper}
                                BadgeComponent={DaisyUiBadgeWrapper}
                                {item}
                                {key}
                                {customSnippets}
                            />
                        {/if}
                    </td>
                {/each}
                {#if rowActionsColumnEnabled}
                    <DaisyUiRowActionsCell {item} />
                {/if}
            {:else}
                <td>No data</td>
            {/if}
        </tr>
        {#if isOpen}
            <tr class="datatable-modal-container border-0 shadow-md">
                <td colspan={columnCount} transition:slide|local>
                    <div
                        class="datatable-modal border-b border-l border-r border-base-content/5 rounded-b-box"
                        transition:slide|local
                    >
                        <config.modalComponent {item} {toggle} />
                    </div>
                </td>
            </tr>
            <tr class="margin-row bottom border-b-0">
                <td colspan={columnCount} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
    {/snippet}
</DataTable.Row>

<style>
    /* Suppress iOS Safari's native long-press callout (text selection /
       link preview) so the synthetic context menu is the only thing the
       user sees on a long-press. The touch-action rule keeps the row from
       hijacking vertical scroll while still allowing the long-press
       detector to fire — `pan-y` lets the browser scroll on a vertical
       swipe but defers single-finger holds to our handler. */
    :global(tr.datatable-row) {
        -webkit-touch-callout: none;
        touch-action: pan-y;
    }
</style>
