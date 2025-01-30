<script lang="ts">
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import InternalSearchField from '$lib/internal/InternalSearchField.svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';

    const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
    }

    let { searchInput = $bindable(''), searchQuery = $bindable(undefined) }: Props = $props();
    let inputElement: HTMLInputElement = $state();
</script>

<InternalSearchField {inputElement} bind:searchQuery {searchInput}>
    <input
        class="input"
        type="search"
        bind:this={inputElement}
        bind:value={searchInput}
        aria-label={$format(`search.ariaLabel`)}
        placeholder={$format(`search.placeholder`)}
    />
</InternalSearchField>
