<script lang='ts'>
	import { Nav } from 'sveltestrap';
	import SidebarItem from './DocsSidebarItem.svelte';
</script>

<Nav class='docs-sidebar pt-3' vertical>
	<SidebarItem heading>
		Getting started
	</SidebarItem>
	<SidebarItem href='overview'>
		Overview
	</SidebarItem>
	<SidebarItem href='installation'>
		Installation
	</SidebarItem>
	<SidebarItem href='quick-start'>
		Quick Start
	</SidebarItem>
</Nav>

