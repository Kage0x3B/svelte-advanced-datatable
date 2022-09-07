<script lang='ts'>
	import { Nav } from 'sveltestrap';
	import SidebarItem from './DocsSidebarItem.svelte';
</script>

<Nav class='docs-sidebar pt-3' vertical>
	<SidebarItem heading>
		Getting started
	</SidebarItem>
	<SidebarItem href='getting-started' matchActiveExact>
		Overview
	</SidebarItem>
	<SidebarItem href='getting-started/installation'>
		Installation
	</SidebarItem>
	<SidebarItem href='getting-started/quick-start'>
		Quick Start
	</SidebarItem>
	<SidebarItem heading>
		Configuration
	</SidebarItem>
	<SidebarItem href='configuration' matchActiveExact>
		General
	</SidebarItem>
	<SidebarItem href='configuration/column-config'>
		Column Configuration
	</SidebarItem>
	<SidebarItem href='configuration/data-sources'>
		Data Sources
	</SidebarItem>
	<SidebarItem heading>
		Guides
	</SidebarItem>
</Nav>

