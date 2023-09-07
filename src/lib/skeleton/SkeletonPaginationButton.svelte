<script lang="ts">
    import { classnames } from '$lib/util/generalUtil.js';
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
    import { DATATABLE_MESSAGE_FORMATTER } from '$lib/util/ContextKey.js';

    const format: Readable<MessageFormatter> = getContext(DATATABLE_MESSAGE_FORMATTER);

    let className = '';
    export { className as class };
    export let active = false;
    export let next = false;
    export let previous = false;
    export let first = false;
    export let last = false;

    $: classes = classnames(className, 'btn-pagination', {
        '!variant-filled-primary active': active
    });

    let type: 'previous' | 'next' | 'first' | 'last';
    let caretCharacter: string;

    $: if (previous) {
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
</script>

<button type="button" class={classes} on:click {...$$restProps}>
    {#if previous || first}
        <span aria-hidden="true"><slot>{caretCharacter}</slot></span><span class="sr-only xl:not-sr-only"
            >&nbsp;{$format(`pagination.${type}`)}</span
        >
    {:else if next || last}
        <span class="sr-only xl:not-sr-only">{$format(`pagination.${type}`)}&nbsp;</span><span
            aria-hidden="true"
            class="border-0 !m-0"><slot>{caretCharacter}</slot></span
        >
    {:else}
        <slot />
    {/if}
</button>
