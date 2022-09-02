<script lang='ts'>
	import { ComponentType } from '../dataComponent/ComponentType.js';
	import { isDateTime } from '../util/generalUtil.js';
	import type { SvelteComponentTyped } from 'svelte';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import type { DataRecord } from '../types/DataRecord.js';
	import type { FullDataTableConfig } from '../types/DataTableConfig.js';
	import type { MessageFormatter } from '../types/MessageFormatter.js';
	import { DATATABLE_CONFIG, DATATABLE_MESSAGE_FORMATTER } from '../util/ContextKey.js';

	const config: FullDataTableConfig = getContext(DATATABLE_CONFIG);
	const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

	export let IconComponent: SvelteComponentTyped;
	export let BadgeComponent: SvelteComponentTyped;
	export let item: DataRecord;
	export let key: string;

	const colProps = config.columnProperties[key];
</script>

<!-- It's better for performance to generate some fields for easy types (string, int, enum, bool, ..) with a simple if -->
{#if colProps.type === ComponentType.CUSTOM}
	<svelte:component this={colProps.component} {key} {colProps} {item} value={item[key]} />
{:else if colProps.type === ComponentType.STRING || colProps.type === ComponentType.NUMBER}
	{#if typeof item[key] !== undefined && item[key] !== null && item[key] !== "null"}
		{$format(`dataTable.${config.type}.${key}.format`, {
			default: String(item[key]),
			values: { value: item[key] }
		})}
	{/if}
{:else if colProps.type === ComponentType.BOOLEAN}
	<!-- Comparison with two equals intended!! -->
	{#if (!colProps.inverted && item[key] == colProps.truthy) || (colProps.inverted && item[key] != colProps.truthy)}
		<svelte:component this={IconComponent} name='check' color='green' />
	{:else}
		<svelte:component this={IconComponent} name='cross' color='red' />
	{/if}
{:else if colProps.type === ComponentType.ENUM}
	<svelte:component this={BadgeComponent} color={colProps.values.includes(item[key]) ? colProps.enumColorKey[item[key]] ?? colProps.enumColorKey.default : colProps.enumColorKey.unknown }>
		{#if colProps.values.includes(item[key])}
			{$format(`dataTable.${config.type}.${key}.enumValue.${item[key]}`)}
		{:else}
			{$format(`dataTable.${config.type}.${key}.enumValue.unknown`)}
		{/if}
	</svelte:component>
{:else if colProps.type === ComponentType.DATE}
	<span title={item[key]}>
		{#if isDateTime(item[key])}
			{item[key].toLocaleString(colProps.dateFormat)}
		{:else}
			{item[key]}
		{/if}
	</span>
{:else}
	Error: No component for type {colProps.type}
{/if}
