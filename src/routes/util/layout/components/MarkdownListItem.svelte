<script lang="ts">
    import { setContext, type Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

    setContext('markdownListItem', true);
</script>

<li>
    {@render children()}
</li>

<style>
    li :global(a) {
        text-decoration: none;
    }
</style>
