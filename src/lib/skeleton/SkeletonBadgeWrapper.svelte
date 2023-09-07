<script lang="ts">
    import { skeletonVariantFilledColorMap } from '$lib/skeleton/skeletonWrappedComponentPropertyMap.js';
    import { mapValue } from '$lib/util/generalUtil.js';
    import type { WrappedComponentColor } from '$lib/dataComponent/WrappedComponentProperty.js';

    export let color: WrappedComponentColor;
</script>

<span class="badge {mapValue(skeletonVariantFilledColorMap, color)}"><slot /></span>
