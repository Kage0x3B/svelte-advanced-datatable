<script lang="ts">
    import '../../../css/app.css';
    import type { LayoutProps } from './$types.js';

    let { children }: LayoutProps = $props();
</script>

<div class="p-5">
    {@render children()}
</div>
