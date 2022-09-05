<script lang='ts'>
	import { page } from '$app/stores';
	import { Col, Container, Row } from 'sveltestrap';
	import ApiReferenceBreadcrumbs from '../util/ApiReferenceBreadcrumbs.svelte';

	export let data: {
		title: string;
		pageContent: string;
	};
</script>

<svelte:head>
	<title>{data.title} - Svelte Advanced Datatable</title>
</svelte:head>

<Container class='mt-3'>
	<Row>
		<Col>
			<ApiReferenceBreadcrumbs currentPath={$page.params.slug} indexName='Svelte Advanced Datatable' baseUrl='/api-reference' />
			{@html data.pageContent}
		</Col>
	</Row>
</Container>
