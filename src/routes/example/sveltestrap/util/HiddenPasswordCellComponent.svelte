<script lang='ts'>
	import { Button, Icon } from 'sveltestrap';

	export let value: string;

	// Export unneeded variables to hide "created with unknown prop" warnings
	export let key = undefined;
	export let colProps = undefined;
	export let item = undefined;

	let isHidden = true;

	function toggle(event: Event) {
		event.stopPropagation();

		isHidden = !isHidden;
	}
</script>

{#if isHidden}
	<Button color='danger' size='sm' on:click={toggle}>
		<Icon name='eye-slash-fill' />
	</Button>
{:else}
	<code class='bg-light p-1 rounded-2' on:click={toggle}>{value}</code>
{/if}
