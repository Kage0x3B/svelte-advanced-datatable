<script lang="ts">
    import { skeletonColorMap } from './skeletonWrappedComponentPropertyMap.js';
    import { mapValue } from '$lib/util/generalUtil.js';
    import type { WrappedComponentColor } from '$lib/dataComponent/WrappedComponentProperty.js';

    interface Props {
        color: WrappedComponentColor;
        children?: import('svelte').Snippet;
    }

    let { color, children }: Props = $props();
</script>

<span class="badge-icon variant-filled-{mapValue(skeletonColorMap, color, true)}">{@render children?.()}</span>
