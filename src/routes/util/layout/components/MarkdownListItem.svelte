<script>
	import { setContext } from 'svelte';

	setContext('markdownListItem', true);
</script>

<li class='list-group-item position-relative'>
	<slot />
</li>

<style>
    li :global(a) {
        text-decoration: none;
    }
</style>
