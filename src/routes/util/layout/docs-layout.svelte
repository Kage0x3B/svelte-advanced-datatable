<script context="module" lang="ts">
    import MarkdownH1 from './components/heading/MarkdownH1.svelte';
    import MarkdownH2 from './components/heading/MarkdownH2.svelte';
    import MarkdownH3 from './components/heading/MarkdownH3.svelte';
    import MarkdownH4 from './components/heading/MarkdownH4.svelte';
    import MarkdownH5 from './components/heading/MarkdownH5.svelte';
    import MarkdownH6 from './components/heading/MarkdownH6.svelte';
    import MarkdownHorizontalRule from './components/MarkdownHorizontalRule.svelte';
    import MarkdownLink from './components/MarkdownLink.svelte';
    import MarkdownListItem from './components/MarkdownListItem.svelte';
    import MarkdownOrderedList from './components/MarkdownOrderedList.svelte';
    import MarkdownTable from './components/MarkdownTable.svelte';
    import MarkdownUnorderedList from './components/MarkdownUnorderedList.svelte';

    export {
        MarkdownH1 as h1,
        MarkdownH2 as h2,
        MarkdownH3 as h3,
        MarkdownH4 as h4,
        MarkdownH5 as h5,
        MarkdownH6 as h6,
        MarkdownUnorderedList as ul,
        MarkdownOrderedList as ol,
        MarkdownListItem as li,
        MarkdownLink as a,
        MarkdownTable as table,
        MarkdownHorizontalRule as hr
    };
</script>

<script lang="ts">
    import { AppShell } from '@skeletonlabs/skeleton';
    import { onDestroy } from 'svelte';
    import Footer from '../Footer.svelte';
    import MainNavbar from '../MainNavbar.svelte';
    import { slugger } from './api-reference-layout.svelte';
    import DocsSidebar from './components/docs/DocsSidebar.svelte';

    export let title = undefined;

    onDestroy(() => slugger.reset());
</script>

<svelte:head>
    <title>{title ?? 'Documentation'} - Svelte Advanced Datatable</title>
</svelte:head>

<AppShell slotPageContent="p-4" slotSidebarLeft="w-full md:w-1/4 lg:w-1/5 xl:w-1/6 pl-4">
    <svelte:fragment slot="header">
        <MainNavbar />
    </svelte:fragment>
    <svelte:fragment slot="sidebarLeft">
        <DocsSidebar />
    </svelte:fragment>
    <div
        class="prose container xl:max-w-[80%] mx-auto lg:prose-lg dark:prose-invert prose-headings:font-normal prose-a:text-primary-500 prose-a:no-underline"
    >
        <slot />
    </div>
    <svelte:fragment slot="pageFooter">
        <Footer />
    </svelte:fragment>
</AppShell>
