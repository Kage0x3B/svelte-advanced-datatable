<script context='module' lang='ts'>
	import GithubSlugger from 'github-slugger';
	import MarkdownH1 from './components/heading/MarkdownH1.svelte';
	import MarkdownH2 from './components/heading/MarkdownH2.svelte';
	import MarkdownH3 from './components/heading/MarkdownH3.svelte';
	import MarkdownH4 from './components/heading/MarkdownH4.svelte';
	import MarkdownH5 from './components/heading/MarkdownH5.svelte';
	import MarkdownH6 from './components/heading/MarkdownH6.svelte';
	import MarkdownHorizontalRule from './components/MarkdownHorizontalRule.svelte';
	import MarkdownLink from './components/MarkdownLink.svelte';
	import MarkdownListItem from './components/MarkdownListItem.svelte';
	import MarkdownOrderedList from './components/MarkdownOrderedList.svelte';
	import MarkdownTable from './components/MarkdownTable.svelte';
	import MarkdownUnorderedList from './components/MarkdownUnorderedList.svelte';

	const slugger = new GithubSlugger();
	export { slugger };

	export { MarkdownH1 as h1, MarkdownH2 as h2, MarkdownH3 as h3, MarkdownH4 as h4, MarkdownH5 as h5, MarkdownH6 as h6, MarkdownUnorderedList as ul, MarkdownOrderedList as ol, MarkdownListItem as li, MarkdownLink as a, MarkdownTable as table, MarkdownHorizontalRule as hr };
</script>

<script lang='ts'>
	import { page } from '$app/stores';
	import { Col, Container, Row } from 'sveltestrap';
	import { onDestroy } from 'svelte';
	import Footer from '../Footer.svelte';
	import ApiReferenceBreadcrumbs from './components/ApiReferenceBreadcrumbs.svelte';

	export let title = undefined;

	onDestroy(() => slugger.reset());
</script>

<svelte:head>
	<title>{title ?? "Api Reference"} - Svelte Advanced Datatable</title>
</svelte:head>

<div id='page-container'>
	<Container class='pt-3 pb-6'>
		<Row>
			<Col>
				<ApiReferenceBreadcrumbs currentPath={$page.url.pathname} indexName='Svelte Advanced Datatable' baseUrl='/api-reference' />

				<slot />
			</Col>
		</Row>
	</Container>
	<Footer />
</div>

<style>
    #page-container {
        position: relative;
        min-height: calc(100vh - 56px);
    }
</style>
