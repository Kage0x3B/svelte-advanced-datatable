<script lang="ts">
    import InternalSearchField from '$lib/internal/InternalSearchField.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';

    const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

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
            aria-label={$format(`search.ariaLabel`)}
            bind:this={inputElement}
            bind:value={searchInput}
            class="search-box"
            placeholder={$format(`search.placeholder`)}
            type="search"
            inputStyle="bordered"
        />
    </div>
</InternalSearchField>
