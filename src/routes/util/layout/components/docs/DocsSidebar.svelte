<script lang="ts">
    import DocsSidebarItem from './DocsSidebarItem.svelte';
</script>

<ul class="menu w-full my-8 whitespace-nowrap">
    <DocsSidebarItem>
        Getting started
        {#snippet submenu()}
            <DocsSidebarItem href="getting-started" matchActiveExact>Overview</DocsSidebarItem>
            <DocsSidebarItem href="getting-started/installation">Installation</DocsSidebarItem>
            <DocsSidebarItem href="getting-started/quick-start">Quick Start</DocsSidebarItem>
        {/snippet}
    </DocsSidebarItem>

    <DocsSidebarItem>
        Configuration
        {#snippet submenu()}
            <DocsSidebarItem href="configuration" matchActiveExact>General</DocsSidebarItem>
            <DocsSidebarItem href="configuration/column-config">Column Configuration</DocsSidebarItem>
            <DocsSidebarItem href="configuration/data-sources">Data Sources</DocsSidebarItem>
        {/snippet}
    </DocsSidebarItem>

    <DocsSidebarItem>
        Examples
        {#snippet submenu()}
            <DocsSidebarItem href="examples/extensive-example">Extensive Example</DocsSidebarItem>
            <DocsSidebarItem href="examples/modal">Modal</DocsSidebarItem>
            <DocsSidebarItem href="examples/custom-columns">Custom Column Components</DocsSidebarItem>
            <DocsSidebarItem href="examples/advanced-search">Advanced Search</DocsSidebarItem>
            <DocsSidebarItem href="examples/error-handling">Error Handling</DocsSidebarItem>
        {/snippet}
    </DocsSidebarItem>
</ul>
