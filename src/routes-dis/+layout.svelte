<script lang="ts">
    import type { LayoutProps } from './$types.js';

    let { children }: LayoutProps = $props();
</script>

{@render children()}
