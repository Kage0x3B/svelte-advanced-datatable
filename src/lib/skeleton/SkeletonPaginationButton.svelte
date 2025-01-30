<script lang="ts">
    import { run, createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';

    const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

    
    interface Props {
        class?: string;
        active?: boolean;
        next?: boolean;
        previous?: boolean;
        first?: boolean;
        last?: boolean;
        children?: import('svelte').Snippet;
        [key: string]: any
    }

    let {
        class: className = '',
        active = false,
        next = false,
        previous = false,
        first = false,
        last = false,
        children,
        ...rest
    }: Props = $props();

    let classes = $derived(`${className} btn btn-pagination ${active ? 'variant-filled-primary active' : 'variant-filled'}`);

    let type: 'previous' | 'next' | 'first' | 'last' = $state();
    let caretCharacter: string = $state();

    run(() => {
        if (previous) {
            type = 'previous';
            caretCharacter = '\u2039';
        } else if (next) {
            type = 'next';
            caretCharacter = '\u203A';
        } else if (first) {
            type = 'first';
            caretCharacter = '\u00ab';
        } else if (last) {
            type = 'last';
            caretCharacter = '\u00bb';
        }
    });
</script>

<button type="button" class={classes} onclick={bubble('click')} {...rest}>
    {#if previous || first}
        <span aria-hidden="true">{#if children}{@render children()}{:else}{caretCharacter}{/if}</span><span class="sr-only hidden xl:inline"
            >&nbsp;{$format(`pagination.${type}`)}</span
        >
    {:else if next || last}
        <span class="sr-only hidden xl:inline">{$format(`pagination.${type}`)}&nbsp;</span><span aria-hidden="true"
            >{#if children}{@render children()}{:else}{caretCharacter}{/if}</span
        >
    {:else}
        {@render children?.()}
    {/if}
</button>
