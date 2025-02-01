<script lang="ts">
    import { page } from '$app/state';
    import type { Snippet } from 'svelte';

    const docsBaseUrl = '/docs/';

    interface Props {
        href?: string | undefined;
        matchActiveRegex?: RegExp | undefined;
        matchActiveExact?: boolean;
        children: Snippet;
        submenu?: Snippet;
    }

    let {
        href = undefined,
        matchActiveRegex = undefined,
        matchActiveExact = href === '/',
        children,
        submenu
    }: Props = $props();

    let fullHref = $derived(href ? docsBaseUrl + href.toLowerCase() : undefined);
    let currentPath = $derived(page.url.pathname.toLowerCase());
    let active = $derived(
        !!href &&
            (matchActiveRegex
                ? matchActiveRegex!.test(currentPath)
                : matchActiveExact
                  ? currentPath === fullHref
                  : currentPath.startsWith(fullHref ?? ''))
    );
</script>

<li>
    <a
        href={fullHref}
        class={{
            'bg-primary text-primary-content': active
        }}
    >
        {@render children()}
    </a>
    {#if submenu}
        <ul>
            {@render submenu()}
        </ul>
    {/if}
</li>
