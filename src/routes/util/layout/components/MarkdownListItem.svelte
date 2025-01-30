<script lang="ts">
    import { setContext } from 'svelte';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    setContext('markdownListItem', true);
</script>

<li>
    {@render children?.()}
</li>

<style>
    li :global(a) {
        text-decoration: none;
    }
</style>
