<script lang="ts">
    import { skeletonColorMap } from './skeletonWrappedComponentPropertyMap.js';
    import { mapValue } from '$lib/util/generalUtil.js';
    import type { WrappedComponentColor } from '$lib/dataComponent/WrappedComponentProperty.js';

    export let color: WrappedComponentColor;
</script>

<span class="badge-icon variant-filled-{mapValue(skeletonColorMap, color, true)}"><slot /></span>
