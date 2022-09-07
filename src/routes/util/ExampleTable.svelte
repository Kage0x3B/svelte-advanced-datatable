<script lang='ts'>
	export let path: string;
	export let description: string;
</script>

<div class='mt-4 mb-5 w-75'>
	<div class='ratio ratio-16x9 border border-1 rounded'>
		<iframe src='/example/{path}' title='Example table {path}'></iframe>
	</div>

	{#if description}
		<div class='d-flex justify-content-center mt-1 mb-5 text-muted'>
			<small>{description}</small>
		</div>
	{/if}
</div>
