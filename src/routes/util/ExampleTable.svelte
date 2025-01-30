<script lang='ts'>
	interface Props {
		path: string;
		description: string;
	}

	let { path, description }: Props = $props();
</script>

<div class='mt-4 mb-5'>
	<div class='ratio ratio-21x9 border border-1 rounded'>
		<iframe src='/example/{path}' title='Example table {path}'></iframe>
	</div>

	{#if description}
		<div class='d-flex justify-content-center mt-1 mb-5 text-muted'>
			<small>{description}</small>
		</div>
	{/if}
</div>
