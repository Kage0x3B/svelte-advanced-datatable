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
    let internalSearchInput = $state('');

    const updateSearchInputDebounced = $derived(
        debounce((newSearchInput: string) => (searchInput = newSearchInput), config.searchDebounceMs)
    );
    $effect(() => updateSearchInputDebounced(internalSearchInput));
    $effect(() => {
        const current = updateSearchInputDebounced;
        return () => current.cancel();
    });
</script>

<InternalSearchField {inputElement} {searchInput}>
    <div class="mr-2">
        <input
            aria-label={format('search.ariaLabel')}
            bind:this={inputElement}
            bind:value={internalSearchInput}
            class="search-box input"
            placeholder={format('search.placeholder')}
            type="search"
        />
    </div>
</InternalSearchField>
