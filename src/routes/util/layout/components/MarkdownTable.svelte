<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();</script>

<div class="table-container">
    <table class="table-compact table-hover">
        {@render children?.()}
    </table>
</div>
