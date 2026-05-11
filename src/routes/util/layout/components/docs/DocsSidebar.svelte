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
        Guides
        {#snippet submenu()}
            <DocsSidebarItem href="guides/data-sources">Data sources</DocsSidebarItem>
            <DocsSidebarItem href="guides/columns">Columns &amp; cell types</DocsSidebarItem>
            <DocsSidebarItem href="guides/search">Search</DocsSidebarItem>
            <DocsSidebarItem href="guides/sorting-pagination">Sorting &amp; pagination</DocsSidebarItem>
            <DocsSidebarItem href="guides/selection-actions">Selection &amp; actions</DocsSidebarItem>
            <DocsSidebarItem href="guides/export">Export</DocsSidebarItem>
            <DocsSidebarItem href="guides/persistence">Persistence</DocsSidebarItem>
            <DocsSidebarItem href="guides/i18n">Internationalisation</DocsSidebarItem>
            <DocsSidebarItem href="guides/modal-row-interactions">Modals &amp; row interactions</DocsSidebarItem>
            <DocsSidebarItem href="guides/display-layout">Display &amp; layout</DocsSidebarItem>
            <DocsSidebarItem href="guides/error-handling">Error handling</DocsSidebarItem>
        {/snippet}
    </DocsSidebarItem>

    <DocsSidebarItem>
        Configuration
        {#snippet submenu()}
            <DocsSidebarItem href="configuration" matchActiveExact>Reference</DocsSidebarItem>
        {/snippet}
    </DocsSidebarItem>
</ul>
