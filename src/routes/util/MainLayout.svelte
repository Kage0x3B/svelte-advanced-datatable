<script lang="ts">
    import IconGithub from '~icons/fa6-brands/github';
</script>

<div class="drawer">
    <input id="main-menu-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
        <!-- Navbar -->
        <div class="navbar bg-base-300 w-full">
            <div class="flex-none lg:hidden">
                <label for="main-menu-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        class="inline-block h-6 w-6 stroke-current"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        ></path>
                    </svg>
                </label>
            </div>
            <div class="mx-2 flex-1 px-2">
                <a href="/">
                    <h3 class="font-bold h3 whitespace-nowrap">Svelte Advanced DataTable</h3>
                </a>
            </div>
            <div class="hidden flex-none lg:block">
                <ul class="menu menu-horizontal">
                    <!-- Navbar menu content here -->
                    <li><a>Navbar Item 1</a></li>
                    <li><a>Navbar Item 2</a></li>
                </ul>
            </div>
        </div>
        <!-- Page content here -->
        Content
    </div>
    <div class="drawer-side">
        <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">
            <!-- Sidebar content here -->
            <li><a>Sidebar Item 1</a></li>
            <li><a>Sidebar Item 2</a></li>
        </ul>
    </div>
</div>
<!--
<AppBar background="bg-primary-500 text-white" gridColumns="grid-cols-3" slotTrail="place-content-end">
    {#snippet lead()}
        <a href="/">
            <h3 class="font-bold h3 whitespace-nowrap">Svelte Advanced DataTable</h3>
        </a>
    {/snippet}
    {#snippet trail()}
        <a href="/docs/getting-started" class="whitespace-nowrap">Documentation</a>
        <a href="/api-reference" class="whitespace-nowrap">API Reference</a>
        <a href="https://github.com/Kage0x3B/svelte-advanced-dataTable" rel="external" target="_blank">
            <IconGithub />
        </a>
    {/snippet}
</AppBar>-->
<!--
<Navbar color="primary" dark expand="md">
    <NavbarBrand href="/"><b>Svelte Advanced DataTable</b></NavbarBrand>
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
                <NavLink href="https://github.com/Kage0x3B/svelte-advanced-dataTable" class="p-0">
                    <Icon name="github" class="icon-md" />
                </NavLink>
            </NavItem>
        </Nav>
    </Collapse>
</Navbar>
-->
