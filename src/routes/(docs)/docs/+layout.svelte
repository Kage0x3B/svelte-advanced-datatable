<script>
	import { Col, Container, Row } from 'sveltestrap';
	import DocsSidebar from './util/DocsSidebar.svelte';
	import github from "svelte-highlight/styles/github";
</script>

<svelte:head>
	{@html github}
</svelte:head>

<Row>
	<Col xs='12' md='3' lg='2'>
		<DocsSidebar />
	</Col>
	<Col xs='12' md='9' lg='10'>
		<Container class='pt-4'>
			<slot />
		</Container>
	</Col>
</Row>
