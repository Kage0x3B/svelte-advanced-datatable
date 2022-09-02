<script lang='ts'>
	import InternalSearchField from '$lib/InternalSearchField.svelte';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import type { FullDataTableConfig } from '../types/DataTableConfig.js';
	import type { MessageFormatter } from '../types/MessageFormatter.js';
	import type { ParsedSearchQuery } from '../types/ParsedSearchQuery.js';
	import { DATATABLE_CONFIG, DATATABLE_MESSAGE_FORMATTER } from '../util/ContextKey.js';

	const config: FullDataTableConfig = getContext(DATATABLE_CONFIG);
	const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

	export let searchInput = '';
	export let searchQuery: ParsedSearchQuery | undefined;
	let inputElement: HTMLInputElement;
</script>

<InternalSearchField {inputElement} bind:searchQuery {searchInput}>
	<div class='form-inline my-lg-0 me-2'>
		<input aria-label={$format(`dataTable.${config.type}.search.ariaLabel`)} bind:this={inputElement} bind:value={searchInput} class='form-control search-box'
			placeholder={$format(`dataTable.${config.type}.search.placeholder`)} type='search'>
	</div>
</InternalSearchField>
