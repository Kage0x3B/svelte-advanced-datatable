<script lang='ts'>
	import { page } from '$app/stores';
	import { SvelteComponentTyped } from 'svelte';
	import { Col, Container, Row } from 'sveltestrap';
	import ApiReferenceBreadcrumbs from './util/ApiReferenceBreadcrumbs.svelte';

	export let data: {
		title: string;
		pageContent: SvelteComponentTyped;
	};
</script>

<svelte:head>
	<title>{data.title} - Svelte Advanced Datatable</title>
</svelte:head>

<Container class='mt-3'>
	<Row>
		<Col>
			<ApiReferenceBreadcrumbs currentPath={$page.params.slug} indexName='Svelte Advanced Datatable' baseUrl='/api-reference' />
			<svelte:component this={data.pageContent} />
		</Col>
	</Row>
</Container>
