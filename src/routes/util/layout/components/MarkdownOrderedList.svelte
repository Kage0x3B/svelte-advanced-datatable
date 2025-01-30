<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<ol class="my-4">
    {@render children?.()}
</ol>
