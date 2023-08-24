<script lang="ts">
    import { sveltestrapColorMap, sveltestrapIconNameMap } from './skeletonWrappedComponentPropertyMap.js';
    import { mapValue } from '$lib/util/generalUtil.js';
    import { Icon } from 'skeleton';
    import type { WrappedComponentColor, WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';

    export let name: WrappedIconName;
    export let color: WrappedComponentColor;
</script>

<Icon name={mapValue(sveltestrapIconNameMap, name)} class="h4 position-absolute text-{sveltestrapColorMap[color]}" />
