<script lang='ts'>
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';
	import InternalSearchField from '$lib/internal/InternalSearchField.svelte';
	import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
	import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
	import { DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';

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
