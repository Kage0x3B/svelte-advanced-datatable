<script>
    import { setContext } from 'svelte';

    setContext('markdownListItem', true);
</script>

<li>
    <slot />
</li>

<style>
    li :global(a) {
        text-decoration: none;
    }
</style>
