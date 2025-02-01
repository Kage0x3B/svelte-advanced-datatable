<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        href: string;
        rel?: string;
        children: Snippet;
    }

    let { href, rel = '', children }: Props = $props();
</script>

<a {href} {rel} class="text-primary-500 hover:text-primary-400 focus:text-primary-600">
    {@render children()}
</a>
