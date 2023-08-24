<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton';
    import IconGithub from '~icons/fa6-brands/github';
</script>

<AppBar background="bg-primary-500 text-white" gridColumns="grid-cols-3" slotTrail="place-content-end">
    <svelte:fragment slot="lead">
        <a href="/">
            <h3 class="font-bold h3 whitespace-nowrap">Svelte Advanced Datatable</h3>
        </a>
    </svelte:fragment>
    <svelte:fragment slot="trail">
        <a href="/docs/getting-started" class="whitespace-nowrap">Documentation</a>
        <a href="/api-reference" class="whitespace-nowrap">API Reference</a>
        <a href="https://github.com/Kage0x3B/svelte-advanced-datatable" rel="external" target="_blank">
            <IconGithub />
        </a>
    </svelte:fragment>
</AppBar>
<!--
<Navbar color="primary" dark expand="md">
    <NavbarBrand href="/"><b>Svelte Advanced Datatable</b></NavbarBrand>
    <NavbarToggler on:click={() => (isNavbarOpen = !isNavbarOpen)} />
    <Collapse isOpen={isNavbarOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href="/docs/getting-started">Documentation</NavLink>
            </NavItem>
            <NavItem>
                <NavLink href="/api-reference">API Reference</NavLink>
            </NavItem>
            <NavItem class="d-flex align-items-center mx-3">
                <NavLink href="https://github.com/Kage0x3B/svelte-advanced-datatable" class="p-0">
                    <Icon name="github" class="icon-md" />
                </NavLink>
            </NavItem>
        </Nav>
    </Collapse>
</Navbar>
-->
