<script lang="ts">
    import InternalSearchField from '$lib/internal/InternalSearchField.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import { configContext, messageFormatterContext } from '$lib/util/context.js';
    import { debounce } from '$lib/util/generalUtil.js';

    const format = $derived(messageFormatterContext.get().current);
    const config = $derived(configContext.get().current);

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
    }

    let { searchInput = $bindable('') }: Props = $props();

    let inputElement: HTMLInputElement | undefined = $state();
    let internalSearchInput = $state(searchInput);
    let lastObservedSearchInput = searchInput;

    // Mirror external changes to `searchInput` (e.g. snapshot restore, URL
    // back/forward, deep-link with persistence) into the input's local state.
    $effect(() => {
        if (searchInput !== lastObservedSearchInput) {
            lastObservedSearchInput = searchInput;
            internalSearchInput = searchInput;
        }
    });

    const updateSearchInputDebounced = $derived(
        debounce((newSearchInput: string) => {
            lastObservedSearchInput = newSearchInput;
            searchInput = newSearchInput;
        }, config.searchDebounceMs)
    );
    $effect(() => updateSearchInputDebounced(internalSearchInput));
    $effect(() => {
        const current = updateSearchInputDebounced;
        return () => current.cancel();
    });
</script>

<InternalSearchField {inputElement} {searchInput}>
    <div class="mr-2 w-full max-w-xs flex-1 md:max-w-sm">
        <input
            aria-label={format('search.ariaLabel')}
            bind:this={inputElement}
            bind:value={internalSearchInput}
            class="search-box input w-full"
            placeholder={format('search.placeholder')}
            type="search"
        />
    </div>
</InternalSearchField>
