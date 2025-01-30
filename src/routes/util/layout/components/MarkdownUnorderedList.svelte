<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<ul class="my-4">
    {@render children?.()}
</ul>
