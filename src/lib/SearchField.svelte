<script lang='ts'>
	import type { ParsedSearchQuery } from './types/ParsedSearchQuery.js';
	import { debounce } from './util/generalUtil.js';

	export let searchInput = '';
	export let searchQuery: ParsedSearchQuery | undefined;
	let inputElement: HTMLInputElement;

	const updateSearch = debounce<[string]>((searchInput) => _updateSearch(searchInput), 200);
	$: updateSearch(searchInput);

	function _updateSearch(searchInput) {
		try {
			//TODO
			//searchQuery = parseSearchQuery(searchInput);

			//if ($searchQuery && ($listeningSearchHandlers > 0 || $searchQuery.forceGlobalSearch)) {
			//}
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

<div class='form-inline my-lg-0 me-2'>
	<input aria-label='Suche' bind:this={inputElement} bind:value={searchInput} class='form-control search-box'
		placeholder='Suche' type='search'>
</div>
