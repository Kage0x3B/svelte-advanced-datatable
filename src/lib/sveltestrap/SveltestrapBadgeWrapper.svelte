<script lang='ts'>
	import { sveltestrapColorMap } from './sveltestrapWrappedComponentPropertyMap.js';
	import { mapValue } from '$lib/util/generalUtil.js';
	import { Badge } from 'sveltestrap';
	import type { WrappedComponentColor } from '../types/WrappedComponentProperty.js';

	export let color: WrappedComponentColor;
</script>

<Badge color={mapValue(sveltestrapColorMap, color, true)}>
	<slot />
</Badge>
