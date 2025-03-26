<script lang="ts">
    import { configContext } from '$lib/util/context.js';
    import type { Snippet } from 'svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
    import { debounce } from '$lib/util/generalUtil.js';

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
        inputElement: HTMLInputElement | undefined;
        children: Snippet;
    }

    let { searchInput = $bindable(''), searchQuery = $bindable(undefined), inputElement, children }: Props = $props();

    const config = $derived(configContext.get().current);

    const updateSearch = debounce((searchInput: string) => _updateSearch(searchInput), 200);
    $effect(() => updateSearch(searchInput));

    function _updateSearch(searchInput: string) {
        try {
            searchQuery = config.searchParser.parseSearchQuery(searchInput);
        } catch (err) {
            console.log(err);

            searchQuery = undefined;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key == 'f') {
            event.preventDefault();

            inputElement?.focus();
        } else if (event.key === 'Escape' && document.activeElement === inputElement) {
            event.preventDefault();

            searchInput = '';
            inputElement?.blur();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{@render children()}
