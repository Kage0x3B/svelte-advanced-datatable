<script lang="ts">
    import DocsSidebarItem from './DocsSidebarItem.svelte';
</script>

<nav class="list-nav w-full my-8 whitespace-nowrap">
    <DocsSidebarItem heading>Getting started</DocsSidebarItem>
    <ul class="mt-2 mb-6">
        <DocsSidebarItem href="getting-started" matchActiveExact>Overview</DocsSidebarItem>
        <DocsSidebarItem href="getting-started/installation">Installation</DocsSidebarItem>
        <DocsSidebarItem href="getting-started/quick-start">Quick Start</DocsSidebarItem>
    </ul>
    <DocsSidebarItem heading>Configuration</DocsSidebarItem>
    <ul class="mt-2 mb-6">
        <DocsSidebarItem href="configuration" matchActiveExact>General</DocsSidebarItem>
        <DocsSidebarItem href="configuration/column-config">Column Configuration</DocsSidebarItem>
        <DocsSidebarItem href="configuration/data-sources">Data Sources</DocsSidebarItem>
    </ul>
    <DocsSidebarItem heading>Examples</DocsSidebarItem>
    <ul class="mt-2 mb-6">
        <DocsSidebarItem href="examples/extensive-example">Extensive Example</DocsSidebarItem>
        <DocsSidebarItem href="examples/modal">Modal</DocsSidebarItem>
    </ul>
</nav>

<!--<Nav class="docs-sidebar pt-3" vertical>
    <DocsSidebarItem heading>Getting started</DocsSidebarItem>
    <DocsSidebarItem href="getting-started" matchActiveExact>Overview</DocsSidebarItem>
    <DocsSidebarItem href="getting-started/installation">Installation</DocsSidebarItem>
    <DocsSidebarItem href="getting-started/quick-start">Quick Start</DocsSidebarItem>
    <DocsSidebarItem heading>Configuration</DocsSidebarItem>
    <DocsSidebarItem href="configuration" matchActiveExact>General</DocsSidebarItem>
    <DocsSidebarItem href="configuration/column-config">Column Configuration</DocsSidebarItem>
    <DocsSidebarItem href="configuration/data-sources">Data Sources</DocsSidebarItem>
    <DocsSidebarItem heading>Examples</DocsSidebarItem>
    <DocsSidebarItem href="examples/extensive-example">Extensive Example</DocsSidebarItem>
    <DocsSidebarItem href="examples/modal">Modal</DocsSidebarItem>
    <--<DocsSidebarItem href='examples/svelte-i18n'>
		Svelte I18n
	</DocsSidebarItem>
	<DocsSidebarItem href='examples/svelte-query'>
		Svelte Query
	</DocsSidebarItem>--
</Nav>
-->
