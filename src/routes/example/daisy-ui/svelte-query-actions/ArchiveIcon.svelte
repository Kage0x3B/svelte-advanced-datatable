<script lang="ts">
    import type { SVGAttributes } from 'svelte/elements';

    let { ...props }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" {...props}>
    <path
        fill="currentColor"
        d="M32 32H480c17.7 0 32 14.3 32 32V96c0 17.7-14.3 32-32 32H32C14.3 128 0 113.7 0 96V64C0 46.3 14.3 32 32 32m0 128H480V416c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64zm165.7 56c-13.3 0-24 10.7-24 24s10.7 24 24 24h116.6c13.3 0 24-10.7 24-24s-10.7-24-24-24z"
    />
</svg>
