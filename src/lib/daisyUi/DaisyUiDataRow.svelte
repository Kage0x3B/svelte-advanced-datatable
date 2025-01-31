<script lang="ts">
    import DataTable from '$lib/internal/index.js';
    import { getConfigContext } from '$lib/util/context.js';
    import { slide } from 'svelte/transition';
    import DaisyUiBadgeWrapper from '$lib/daisyUi/DaisyUiBadgeWrapper.svelte';
    import DaisyUiIconWrapper from '$lib/daisyUi/DaisyUiIconWrapper.svelte';

    const config = getConfigContext()();

    interface Props {
        index: number;
        openIndex: number | undefined;
        highlighted: boolean;
        onClick: (<T>(item: T) => void | Promise<void>) | undefined;
        item: Record<string, unknown>;
        open: (index: number) => void;
    }

    let { index, openIndex, highlighted, onClick, item, open }: Props = $props();
</script>

<DataTable.Row {index} {openIndex} {onClick} {item} {open}>
    {#snippet children({ isOpen, rowOnClick, toggle })}
        {#if isOpen}
            <tr class="margin-row top">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
        <tr class="datatable-row" class:expanded={isOpen} class:highlighted onclick={rowOnClick}>
            {#if item}
                {#each Object.entries(config.columnProperties) as [key, colProp]}
                    {#if !colProp?.hidden}
                        <td>
                            <DataTable.Column
                                IconComponent={DaisyUiIconWrapper}
                                BadgeComponent={DaisyUiBadgeWrapper}
                                {item}
                                {key}
                            />
                        </td>
                    {/if}
                {/each}
            {:else}
                <td>No data</td>
            {/if}
        </tr>
        {#if isOpen}
            <tr class="datatable-modal-container">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>
                    <div class="datatable-modal" transition:slide|local>
                        <config.modalComponent {item} {toggle} />
                    </div>
                </td>
            </tr>
            <tr class="margin-row bottom">
                <td colspan={Object.keys(config.columnProperties).length} transition:slide|local>&nbsp;</td>
            </tr>
        {/if}
    {/snippet}
</DataTable.Row>

<style>
    .datatable-row {
        cursor: pointer;
        transition: background-color 0.2s;
        white-space: nowrap;
    }

    .datatable-row.highlighted {
        background-color: #f0f;
    }

    .datatable-modal-container > td:hover,
    .margin-row > td:hover {
        box-shadow: none;
    }

    .datatable-row.expanded td {
        background-color: rgba(0, 0, 0, 0.075);
        border-bottom: 0;
    }

    .datatable-row.expanded td:first-child {
        border-left: 1px solid #dee2e6;
        border-top-left-radius: 10px;
    }

    .datatable-row.expanded td:last-child {
        border-right: 1px solid #dee2e6;
        border-top-right-radius: 10px;
    }

    .datatable-modal-container {
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .datatable-modal-container td {
        border-top: 0;
        border-bottom: 1px solid #dee2e6;
        border-left: 1px solid #dee2e6;
        border-right: 1px solid #dee2e6;

        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .margin-row td {
        border-top: 0;
        border-bottom: 0;
    }
</style>
