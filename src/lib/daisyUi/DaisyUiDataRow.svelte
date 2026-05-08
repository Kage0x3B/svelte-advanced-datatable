<script lang="ts">
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import DataTable from '$lib/internal/index.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import { configContext } from '$lib/util/context.js';
    import { slide } from 'svelte/transition';
    import DaisyUiBadgeWrapper from '$lib/daisyUi/DaisyUiBadgeWrapper.svelte';
    import DaisyUiIconWrapper from '$lib/daisyUi/DaisyUiIconWrapper.svelte';

    const config = $derived(configContext.get().current);

    interface Props {
        state: InternalDataTableState;
        index: number;
        highlighted: boolean;
        onClick: (<T>(item: T) => void | Promise<void>) | undefined;
        href: string | undefined;
        item: Record<string, unknown>;
        open: (index: number) => void;

        customSnippets: CustomSnippetProps;
    }

    let { state, index, highlighted, onClick, href, item, open, customSnippets }: Props = $props();

    const columnEntries = $derived(Object.entries(config.columnProperties));

    /** Filter out columns the user has hidden via the settings popover plus
     * the always-permanent `hidden` config flag, so cells line up with the
     * header row. Counted into `columnCount` so spanning rows (modal expand,
     * margin spacers) cover the right number of cells. */
    const visibleColumnEntries = $derived(
        columnEntries.filter(([key, colProp]) => !colProp?.hidden && state.columnVisibility[key] !== false)
    );
    const columnCount = $derived(visibleColumnEntries.length);
</script>

<DataTable.Row {state} {index} {onClick} {item} {open}>
    {#snippet children({ isOpen, rowOnClick, toggle })}
        {#if isOpen}
            <tr class="margin-row top border-b-0">
                <td colspan={columnCount} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
        <tr
            class={[
                'datatable-row cursor-pointer whitespace-nowrap transition-colors duration-200',
                {
                    'bg-base-300': highlighted,
                    'border-0 rounded-t-box': isOpen
                }
            ]}
            class:expanded={isOpen}
            class:highlighted
            onclick={rowOnClick}
        >
            {#if item}
                {#each visibleColumnEntries as [key, _colProp] (key)}
                    <td class={[isOpen && 'bg-base-300 border-0 first:rounded-tl-box last:rounded-tr-box']}>
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
