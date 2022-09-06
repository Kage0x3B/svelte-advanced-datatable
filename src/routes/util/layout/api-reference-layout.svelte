<script context='module' lang='ts'>
	import GithubSlugger from 'github-slugger';
	import MarkdownH1 from './components/heading/MarkdownH1.svelte';
	import MarkdownH2 from './components/heading/MarkdownH2.svelte';
	import MarkdownH3 from './components/heading/MarkdownH3.svelte';
	import MarkdownH4 from './components/heading/MarkdownH4.svelte';
	import MarkdownH5 from './components/heading/MarkdownH5.svelte';
	import MarkdownH6 from './components/heading/MarkdownH6.svelte';

	const slugger = new GithubSlugger();
	export { slugger };

	export { MarkdownH1 as h1, MarkdownH2 as h2, MarkdownH3 as h3, MarkdownH4 as h4, MarkdownH5 as h5, MarkdownH6 as h6 };
</script>

<script lang='ts'>
	import { page } from '$app/stores';
	import { Col, Container, Row } from 'sveltestrap';
	import { onDestroy } from 'svelte';
	import ApiReferenceBreadcrumbs from './components/ApiReferenceBreadcrumbs.svelte';

	export let title = undefined;

	onDestroy(() => slugger.reset());
</script>

<svelte:head>
	<title>{title ?? "Api Reference"} - Svelte Advanced Datatable</title>
</svelte:head>

<Container class='mt-3'>
	<Row>
		<Col>
			<ApiReferenceBreadcrumbs currentPath={$page.url.pathname} indexName='Svelte Advanced Datatable' baseUrl='/api-reference' />

			<slot />
		</Col>
	</Row>
</Container>
