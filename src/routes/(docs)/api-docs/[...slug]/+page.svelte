<script>
	import { Col, Container, Row } from 'sveltestrap';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<Container class='mt-3'>
	<Row>
		<Col>
			{@html data.pageContent}
		</Col>
	</Row>
</Container>
