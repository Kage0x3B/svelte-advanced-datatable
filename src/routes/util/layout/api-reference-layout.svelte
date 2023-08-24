<script context="module" lang="ts">
    import GithubSlugger from 'github-slugger';
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

    const slugger = new GithubSlugger();
    export { slugger };

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
    import { page } from '$app/stores';
    import { AppShell } from '@skeletonlabs/skeleton';
    import { onDestroy } from 'svelte';
    import Footer from '../Footer.svelte';
    import MainNavbar from '../MainNavbar.svelte';
    import ApiReferenceBreadcrumbs from './components/ApiReferenceBreadcrumbs.svelte';

    export let title = undefined;

    onDestroy(() => slugger.reset());
</script>

<svelte:head>
    <title>{title ?? 'Api Reference'} - Svelte Advanced Datatable</title>
</svelte:head>

<AppShell>
    <svelte:fragment slot="header">
        <MainNavbar />
    </svelte:fragment>
    <div class="container xl:max-w-[80vw] mx-auto my-8">
        <ApiReferenceBreadcrumbs
            currentPath={$page.url.pathname}
            indexName="Svelte Advanced Datatable"
            baseUrl="/api-reference"
        />
        <div
            class="mt-4 prose lg:prose-lg dark:prose-invert prose-headings:font-normal prose-a:text-primary-500 prose-a:no-underline prose-ul:border prose-ul:rounded prose-ul:p-0 prose-li:border-b prose-li:list-none prose-li:m-0 prose-li:px-4 prose-li:py-2 prose-code:text-error-400 before:prose-code:hidden after:prose-code:hidden"
        >
            <slot />
        </div>
    </div>
    <svelte:fragment slot="footer">
        <Footer />
    </svelte:fragment>
</AppShell>
