<script lang="ts">
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import DataTable from '$lib/internal/index.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import {
        configContext,
        rowActionsColumnEnabledContext,
        rowFocusContext,
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
            onfocus={() => {
                rowFocus.focusedIndex = index;
            }}
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
