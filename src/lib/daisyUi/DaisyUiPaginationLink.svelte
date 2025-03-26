<script lang="ts">
    import { messageFormatterContext } from '$lib/util/context.js';
    import { preventEvent } from '$lib/util/generalUtil.js';
    import type { Snippet } from 'svelte';

    const format = $derived(messageFormatterContext.get().current);

    interface Props {
        class?: string;
        next?: boolean;
        previous?: boolean;
        first?: boolean;
        last?: boolean;
        href?: string;
        children?: Snippet;
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

    let type: 'previous' | 'next' | 'first' | 'last' = $derived.by(() => {
        if (previous) {
            return 'previous';
        } else if (next) {
            return 'next';
        } else if (first) {
            return 'first';
        } else {
            return 'last';
        }
    });
    let caretCharacter = $derived(
        {
            previous: '\u2039',
            next: '\u203A',
            first: '\u00ab',
            last: '\u00bb'
        }[type]
    );
</script>

<a {...rest} class={['page-link', className]} {href} ondragstart={preventEvent}>
    {#if previous || first}
        <span aria-hidden="true"
            >{#if children}{@render children()}{:else}{caretCharacter}{/if}</span
        ><span class="d-none d-xl-inline sr-only">&nbsp;{format(`pagination.${type}`)}</span>
    {:else if next || last}
        <span class="d-none d-xl-inline sr-only">{format(`pagination.${type}`)}&nbsp;</span><span aria-hidden="true"
            >{#if children}{@render children()}{:else}{caretCharacter}{/if}</span
        >
    {:else}
        {@render children?.()}
    {/if}
</a>
