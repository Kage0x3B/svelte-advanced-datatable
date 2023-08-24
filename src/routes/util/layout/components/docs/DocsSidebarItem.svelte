<script lang="ts">
    import { page } from '$app/stores';

    const docsBaseUrl = '/docs/';

    export let href: string | undefined = undefined;
    export let heading = false;

    export let matchActiveRegex: RegExp | undefined = undefined;
    export let matchActiveExact = href === '/';

    $: fullHref = docsBaseUrl + href?.toLowerCase();
    $: currentPath = $page.url.pathname.toLowerCase();
    $: active =
        !!href &&
        (matchActiveRegex
            ? matchActiveRegex!.test(currentPath)
            : matchActiveExact
            ? currentPath === fullHref
            : currentPath.startsWith(fullHref));
</script>

{#if href}
    <li>
        <a href={fullHref} class={active ? '!bg-primary-400 !text-black' : ''}>
            <slot />
        </a>
    </li>
{:else if heading}
    <h5 class="font-bold px-4 text-2xl">
        <slot />
    </h5>
{/if}
