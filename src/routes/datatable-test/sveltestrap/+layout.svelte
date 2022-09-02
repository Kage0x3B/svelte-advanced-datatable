<script lang='ts'>
	import { Col, Container, Nav, NavItem, NavLink, Row, Styles } from 'sveltestrap';
</script>

<Container fluid>
	<Row>
		<Col xs='12' lg='2' xl='1'>
			<Nav vertical class='pt-3 position-fixed'>
				<NavItem>
					<NavLink href='/sveltestrap/basic'>Basic</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href='#'>Link</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href='#'>Another Link</NavLink>
				</NavItem>
				<NavItem>
					<NavLink disabled href='#'>Disabled Link</NavLink>
				</NavItem>
			</Nav>
		</Col>
		<Col xs='12' lg='10' xl='11' class='px-5 py-3'>
			<slot />
		</Col>
	</Row>
</Container>

<Styles />
