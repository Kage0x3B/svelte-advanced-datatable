<script lang='ts'>
	import { Col, Container, Nav, NavItem, NavLink, Row } from 'sveltestrap';
	import BootstrapStyles from '../../util/BootstrapStyles.svelte';
</script>

<BootstrapStyles />

<Container fluid>
	<Row>
		<Col xs='12' lg='2' xl='1' class='border-right border-1'>
			<Nav vertical class='pt-3 position-fixed'>
				<NavItem>
					<NavLink href='/datatable-test/sveltestrap/basic'>Basic</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href='/datatable-test/sveltestrap/i18n'>svelte-i18n Support</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href='/datatable-test/sveltestrap/modal'>Table Row Modal</NavLink>
				</NavItem>
			</Nav>
		</Col>
		<Col xs='12' lg='10' xl='11' class='px-5 py-3'>
			<slot />
		</Col>
	</Row>
</Container>

