<script lang='ts'>
	import { getContext } from 'svelte';
	import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
	import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
	import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';
	import { debounce } from '$lib/util/generalUtil.js';

	export let searchInput = '';
	export let searchQuery: ParsedSearchQuery | undefined = undefined;
	export let inputElement: HTMLInputElement;

	const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);

	const updateSearch = debounce<[string]>((searchInput) => _updateSearch(searchInput), 200);
	$: updateSearch(searchInput);

	function _updateSearch(searchInput) {
		try {
			searchQuery = config.searchParser.parseSearchQuery(searchInput);
		} catch (err) {
			console.log(err);

			searchQuery = null;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey && e.key == 'f') {
			e.preventDefault();

			inputElement && inputElement.focus();
		} else if (e.key === 'Escape' && document.activeElement === inputElement) {
			e.preventDefault();

			searchInput = '';
			inputElement && inputElement.blur();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<slot />
