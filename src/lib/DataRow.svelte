<script lang='ts'>
	import { ComponentType } from '$lib/dataComponent/ComponentType.js';
	import type { MaybePromise } from '$lib/types';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { Badge, Icon } from 'sveltestrap';
	import type { ComponentTypeProperties } from './dataComponent/ComponentType.js';
	import type { DataRecord } from './types/DataRecord.js';
	import type { MessageFormatter } from './types/MessageFormatter.js';
	import { DATATABLE_MESSAGE_FORMATTER } from './util/ContextKey.js';
	import { isDateTime } from './util/generalUtil.js';

	export let dataTableType: string;
	export let index: number;
	export let openIndex: number;
	export let highlighted: boolean;

	export let onClick: (<T>(item: T) => MaybePromise<void>) | undefined;
	export let modalComponent;
	export let columnProperties: Record<string, ComponentTypeProperties>;
	export let item: DataRecord;
	export let open: (index: number) => void;

	const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

	const isExpandable = !!modalComponent;

	let isOpen: boolean;
	$: isOpen = isExpandable && index === openIndex;

	export const toggle: () => void = () => isExpandable && item && open(isOpen ? -1 : index);

	async function _onClick() {
		if (onClick) {
			await onClick(item);
		} else if (isExpandable) {
			toggle();
		}
	}
</script>

{#if isOpen}
	<tr class='margin-row top'>
		<td colspan={columnProperties.length} transition:slide|local></td>
	</tr>
{/if}
<tr class='datatable-row' class:expanded={isOpen} class:highlighted on:click={_onClick}>
	{#if item}
		{#each Object.entries(columnProperties) as [key, colProp]}
			{#if !colProp.cellHidden && !colProp.hidden}
				<td>
					<!-- It's better for performance to generate some fields for easy types (string, int, enum, bool, ..) with a simple if -->
					{#if colProp.type === ComponentType.CUSTOM}
						<svelte:component this={colProp.component} {key} {colProp} {item} field={item[key]} />
					{:else if colProp.type === ComponentType.STRING || colProp.type === ComponentType.NUMBER}
						{#if typeof item[key] !== undefined && item[key] !== null && item[key] !== "null"}
							{$format(`dataTable.${dataTableType}.${key}.format`, {
								default: item[key],
								values: { value: item[key] }
							})}
						{/if}
					{:else if colProp.type === ComponentType.BOOLEAN}
						<!-- Comparison with two equals intended!! -->
						{#if colProp.inverted}
							{#if item[key] != colProp.truthy}
								<Icon name='check' class='h4 position-absolute text-success' />
							{:else}
								<Icon name='x' class='h4 position-absolute text-danger' />
							{/if}
						{:else}
							{#if item[key] == colProp.truthy}
								<Icon name='check' class='h4 position-absolute text-success' />
							{:else}
								<Icon name='x' class='h4 position-absolute text-danger' />
							{/if}
						{/if}
					{:else if colProp.type === ComponentType.ENUM}
						<Badge
							color={colProp.values.includes(item[key]) ? colProp.enumColorKey[item[key]] ?? colProp.enumColorKey.default : colProp.enumColorKey.unknown }>
							{#if colProp.values.includes(item[key])}
								{$format(`dataTable.${dataTableType}.${key}.enumValue.${item[key]}`)}
							{:else}
								{$format(`dataTable.${dataTableType}.${key}.enumValue.unknown`)}
							{/if}
						</Badge>
					{:else if colProp.type === ComponentType.DATE}
                        <span title={item[key]}>
                            {#if isDateTime(item[key])}
								{item[key].toLocaleString(colProp.dateFormat)}
                            {:else}
                                {item[key]}
                            {/if}
                        </span>
					{:else}
						Error: No component for type {colProp.type}
					{/if}
				</td>
			{/if}
		{/each}
	{:else}
		No data
	{/if}
</tr>
{#if isOpen}
	<tr class='datatable-modal-container'>
		<td colspan={Object.keys(columnProperties).length} transition:slide|local>
			<div class='datatable-modal' transition:slide|local>
				<svelte:component this={modalComponent} {columnProperties} {item} {toggle} />
			</div>
		</td>
	</tr>
	<tr class='margin-row bottom'>
		<td colspan={Object.keys(columnProperties).length} transition:slide|local></td>
	</tr>
{/if}

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
