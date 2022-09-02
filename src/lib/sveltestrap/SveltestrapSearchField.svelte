<script lang='ts'>
	import InternalSearchField from '../internal/InternalSearchField.svelte';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import type { MessageFormatter } from '../types/MessageFormatter.js';
	import type { ParsedSearchQuery } from '../searchParser/ParsedSearchQuery.js';
	import { DATATABLE_MESSAGE_FORMATTER } from '../util/ContextKey.js';

	const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

	export let searchInput = '';
	export let searchQuery: ParsedSearchQuery | undefined = undefined;
	let inputElement: HTMLInputElement;
</script>

<InternalSearchField {inputElement} bind:searchQuery {searchInput}>
	<div class='form-inline my-lg-0 me-2'>
		<input aria-label={$format(`search.ariaLabel`)} bind:this={inputElement} bind:value={searchInput} class='form-control search-box'
			placeholder={$format(`search.placeholder`)} type='search'>
	</div>
</InternalSearchField>
