<script lang="ts">
	import MarkdownHeading from './MarkdownHeading.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<MarkdownHeading h1>
	{@render children?.()}
</MarkdownHeading>
