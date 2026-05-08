<script lang="ts">
    import type { SVGAttributes } from 'svelte/elements';

    let { ...props }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="0.25em" height="1em" viewBox="0 0 128 512" {...props}>
    <path
        fill="currentColor"
        d="M64 360a56 56 0 1 0 0 112a56 56 0 1 0 0-112m0-160a56 56 0 1 0 0 112a56 56 0 1 0 0-112M120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0"
    />
</svg>
