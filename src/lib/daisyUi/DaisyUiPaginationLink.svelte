<script lang="ts">
    import { run, createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import type { MessageFormatter } from 'svelte-advanced-datatable';
    import { DATATABLE_MESSAGE_FORMATTER } from 'svelte-advanced-datatable';
    import { preventEvent } from '$lib/util.js';

    const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

    
    interface Props {
        class?: string;
        next?: boolean;
        previous?: boolean;
        first?: boolean;
        last?: boolean;
        href?: string;
        children?: import('svelte').Snippet;
        [key: string]: any
    }

    let {
        class: className = '',
        next = false,
        previous = false,
        first = false,
        last = false,
        href = '',
        children,
        ...rest
    }: Props = $props();

    let classes = $derived(`${className} page-link`);

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

<a {...rest} class={classes} {href} onclick={bubble('click')} ondragstart={preventEvent}>
    {#if previous || first}
        <span aria-hidden="true">{#if children}{@render children()}{:else}{caretCharacter}{/if}</span><span class="d-none d-xl-inline sr-only"
            >&nbsp;{$format(`pagination.${type}`)}</span
        >
    {:else if next || last}
        <span class="d-none d-xl-inline sr-only">{$format(`pagination.${type}`)}&nbsp;</span><span aria-hidden="true"
            >{#if children}{@render children()}{:else}{caretCharacter}{/if}</span
        >
    {:else}
        {@render children?.()}
    {/if}
</a>
