<script lang="ts">
    import { slugger } from '../../api-reference-layout.svelte';

    interface Props {
        h1?: boolean;
        h2?: boolean;
        h3?: boolean;
        h4?: boolean;
        h5?: boolean;
        h6?: boolean;
        children?: import('svelte').Snippet;
    }

    let {
        h1 = true,
        h2 = false,
        h3 = false,
        h4 = false,
        h5 = false,
        h6 = false,
        children
    }: Props = $props();

    // Reversed to default to h1
    const headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = h6 ? 6 : h5 ? 5 : h4 ? 4 : h3 ? 3 : h2 ? 2 : 1;
    const headingTag = 'h' + headingLevel;

    let headingTextElement: HTMLSpanElement = $state();
    let title = $derived(headingTextElement ? headingTextElement.innerText : '');
    let slug = $derived(slugger.slug(title));
</script>

<svelte:element this={headingTag} class="markdown-heading" class:mb-5={headingLevel === 1} id={slug}>
    <span bind:this={headingTextElement}>{@render children?.()}</span>
    {#if headingLevel > 1}
        <a class="direct-link" title="Direct link to heading" href="#{slug}">#</a>
    {/if}
</svelte:element>

<style>
    .direct-link {
        opacity: 0;
        transition: opacity 0.5s;
        text-decoration: none;
    }

    .markdown-heading:hover > .direct-link {
        opacity: 1;
    }
</style>
