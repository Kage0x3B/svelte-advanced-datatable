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
        item: Record<string, unknown>;
        open: (index: number) => void;

        customSnippets?: CustomSnippetProps;
    }

    let { state, index, highlighted, onClick, item, open, customSnippets }: Props = $props();
</script>

<DataTable.Row {state} {index} {onClick} {item} {open}>
    {#snippet children({ isOpen, rowOnClick, toggle })}
        {#if isOpen}
            <tr class="margin-row top border-b-0">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>&nbsp;</td>
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
                {#each Object.entries(config.columnProperties) as [key, colProp]}
                    {#if !colProp?.hidden}
                        <td class={[isOpen && 'bg-base-300 border-0 first:rounded-tl-box last:rounded-tr-box']}>
                            <DataTable.Column
                                IconComponent={DaisyUiIconWrapper}
                                BadgeComponent={DaisyUiBadgeWrapper}
                                {item}
                                {key}
                                {customSnippets}
                            />
                        </td>
                    {/if}
                {/each}
            {:else}
                <td>No data</td>
            {/if}
        </tr>
        {#if isOpen}
            <tr class="datatable-modal-container border-0 shadow-md">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>
                    <div
                        class="datatable-modal border-b border-l border-r border-base-content/5 rounded-b-box"
                        transition:slide|local
                    >
                        <config.modalComponent {item} {toggle} />
                    </div>
                </td>
            </tr>
            <tr class="margin-row bottom border-b-0">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
    {/snippet}
</DataTable.Row>
