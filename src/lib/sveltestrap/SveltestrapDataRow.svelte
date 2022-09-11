<script lang='ts'>
	import SveltestrapBadgeWrapper from '$lib/sveltestrap/SveltestrapBadgeWrapper.svelte';
	import SveltestrapIconWrapper from '$lib/sveltestrap/SveltestrapIconWrapper.svelte';
	import type { MaybePromise } from '$lib/types';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import InternalDataColumn from '$lib/internal/InternalDataColumn.svelte';
	import InternalDataRow from '$lib/internal/InternalDataRow.svelte';
	import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
	import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';

	const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);

	export let index: number;
	export let openIndex: number;
	export let highlighted: boolean;

	export let onClick: (<T>(item: T) => MaybePromise<void>) | undefined;
	export let item: unknown;
	export let open: (index: number) => void;

	let toggle: () => void | undefined;
</script>

<InternalDataRow let:isOpen let:rowOnClick bind:toggle {index} {openIndex} {onClick} {item} {open}>
	{#if isOpen}
		<tr class='margin-row top'>
			<td colspan={Object.keys(config.columnProperties).length} transition:slide|local></td>
		</tr>
	{/if}
	<tr class='datatable-row' class:expanded={isOpen} class:highlighted on:click={rowOnClick}>
		{#if item}
			{#each Object.entries(config.columnProperties) as [key, colProp]}
				{#if !colProp.hidden}
					<td>
						<InternalDataColumn IconComponent={SveltestrapIconWrapper} BadgeComponent={SveltestrapBadgeWrapper} {item} {key} />
					</td>
				{/if}
			{/each}
		{:else}
			No data
		{/if}
	</tr>
	{#if isOpen}
		<tr class='datatable-modal-container'>
			<td colspan={Object.keys(config.columnProperties).length} transition:slide|local>
				<div class='datatable-modal' transition:slide|local>
					<svelte:component this={config.modalComponent} {item} {toggle} />
				</div>
			</td>
		</tr>
		<tr class='margin-row bottom'>
			<td colspan={Object.keys(config.columnProperties).length} transition:slide|local></td>
		</tr>
	{/if}
</InternalDataRow>

<style>
    .datatable-row {
        cursor: pointer;
        transition: background-color 0.2s;
        white-space: nowrap;
    }

    .datatable-row.highlighted {
        background-color: #f0f;
    }

    .datatable-modal-container > td:hover, .margin-row > td:hover {
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
