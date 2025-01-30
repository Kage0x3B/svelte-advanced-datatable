<script lang="ts">
    import { page } from '$app/state';

    const docsBaseUrl = '/docs/';


    interface Props {
        href?: string | undefined;
        heading?: boolean;
        matchActiveRegex?: RegExp | undefined;
        matchActiveExact?: any;
        children?: import('svelte').Snippet;
    }

    let {
        href = undefined,
        heading = false,
        matchActiveRegex = undefined,
        matchActiveExact = href === '/',
        children
    }: Props = $props();

    let fullHref = $derived(docsBaseUrl + href?.toLowerCase());
    let currentPath = $derived(page.url.pathname.toLowerCase());
    let active =
        $derived(!!href &&
        (matchActiveRegex
            ? matchActiveRegex!.test(currentPath)
            : matchActiveExact
            ? currentPath === fullHref
            : currentPath.startsWith(fullHref)));
</script>

{#if href}
    <li>
        <a href={fullHref} class={active ? '!bg-primary-400 !text-black' : ''}>
            {@render children?.()}
        </a>
    </li>
{:else if heading}
    <h5 class="font-bold px-4 text-2xl">
        {@render children?.()}
    </h5>
{/if}
