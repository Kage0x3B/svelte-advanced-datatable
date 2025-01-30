<script lang="ts">
    import '../../../css/app.pcss';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="p-5">
    {@render children?.()}
</div>
