<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { ParsedSearchQuery } from '$lib/searchParser/index.js';

    interface Props {
        searchInput?: string;
        searchQuery?: ParsedSearchQuery | undefined;
        inputElement: HTMLInputElement | undefined;
        children: Snippet;
    }

    let { searchInput = $bindable(''), searchQuery = $bindable(undefined), inputElement, children }: Props = $props();

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
