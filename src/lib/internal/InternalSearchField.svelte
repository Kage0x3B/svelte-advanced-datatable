<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
    import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';
    import { debounce } from '$lib/util/generalUtil.js';

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
        inputElement: HTMLInputElement | undefined;
        children: Snippet;
    }

    let { searchInput = $bindable(''), searchQuery = $bindable(undefined), inputElement, children }: Props = $props();

    const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);

    $effect(() => {
        updateSearch(searchInput);
    });
    const updateSearch = debounce((searchInput: string) => _updateSearch(searchInput), 200);

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

            inputElement && inputElement.focus();
        } else if (event.key === 'Escape' && document.activeElement === inputElement) {
            event.preventDefault();

            searchInput = '';
            inputElement && inputElement.blur();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{@render children()}
