<script>
	import { Collapse, Icon, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'sveltestrap';

	let isNavbarOpen = false;

	function handleUpdate(event) {
		isNavbarOpen = event.detail.isOpen;
	}
</script>
<Navbar color='primary' dark expand='md'>
	<NavbarBrand href='/'><b>Svelte Advanced Datatable</b></NavbarBrand>
	<NavbarToggler on:click={() => (isNavbarOpen = !isNavbarOpen)} />
	<Collapse isOpen={isNavbarOpen} navbar expand='md' on:update={handleUpdate}>
		<Nav class='ms-auto' navbar>
			<NavItem>
				<NavLink href='/docs/getting-started'>Documentation</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href='/api-reference'>API Reference</NavLink>
			</NavItem>
			<NavItem class='d-flex align-items-center mx-3'>
				<NavLink href='https://github.com/Kage0x3B/svelte-advanced-datatable' class='p-0'>
					<Icon name='github' class='icon-md' />
				</NavLink>
			</NavItem>
		</Nav>
	</Collapse>
</Navbar>
