<script lang='ts'>
	import { Button, Icon } from 'sveltestrap';

	export let value: string;

	let isHidden = true;
</script>

{#if isHidden}
	<Button color='danger' size='sm' on:click={() => isHidden = false}>
		<Icon name='eye-slash-fill' />
	</Button>
{:else}
	<code class='bg-light p-1 rounded-2' on:click={() => isHidden = true}>{value}</code>
{/if}
