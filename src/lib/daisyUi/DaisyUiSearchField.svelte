<script lang="ts">
    import InternalSearchField from '$lib/internal/InternalSearchField.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import { messageFormatterContext } from '$lib/util/context.js';

    const format = $derived(messageFormatterContext.get().current);

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
    }

    let { searchInput = $bindable(''), searchQuery = $bindable(undefined) }: Props = $props();
    let inputElement: HTMLInputElement | undefined = $state();
</script>

<InternalSearchField {inputElement} bind:searchQuery {searchInput}>
    <div class="mr-2">
        <input
            aria-label={format(`search.ariaLabel`)}
            bind:this={inputElement}
            bind:value={searchInput}
            class="search-box input"
            placeholder={format(`search.placeholder`)}
            type="search"
        />
    </div>
</InternalSearchField>
