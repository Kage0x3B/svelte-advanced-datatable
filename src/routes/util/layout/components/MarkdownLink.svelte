<script lang='ts'>
	import { getContext } from 'svelte';

	export let href: string;

	const isListChild = getContext('markdownListItem');
</script>

<a {href} class='{isListChild ? "stretched-link" : ""}'>
	<slot />
</a>
