<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="table-container">
    <table class="table-compact table-hover">
        {@render children()}
    </table>
</div>
