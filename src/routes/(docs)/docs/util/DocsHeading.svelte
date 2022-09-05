<script lang='ts'>

	export let title: string;

	export let h1 = true;
	export let h2 = false;
	export let h3 = false;
	export let h4 = false;
	export let h5 = false;
	export let h6 = false;

	// Reversed to default to h1
	const headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = h6 ? 6 : h5 ? 5 : h4 ? 4 : h3 ? 3 : h2 ? 2 : 1;
	const headingTag = 'h' + headingLevel;

	const slug = generateSlug(title);

	function generateSlug(value: string): string {
		value = value.replace(/-/, ' ');
		value = value.replace(/[^\w\s]/, '');
		value = value.toLowerCase();

		return value.replace(/\s+/, '-');
	}
</script>


<svelte:element this={headingTag} class='docs-heading' class:mb-5={headingLevel === 1} id={slug}>
	{title}
	<a class='direct-link' title='Direct link to heading' href='#{slug}'>#</a>
</svelte:element>

<style>
    .direct-link {
        opacity: 0;
        transition: opacity 0.5s;
        text-decoration: none;
    }

    .docs-heading:hover > .direct-link {
        opacity: 1;
    }
</style>
