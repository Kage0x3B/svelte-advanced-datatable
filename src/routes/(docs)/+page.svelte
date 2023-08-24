<script lang="ts">
    import Footer from '../util/Footer.svelte';
    import Button from '../util/Button.svelte';
    import { AppShell } from '@skeletonlabs/skeleton';
    import MainNavbar from '../util/MainNavbar.svelte';
</script>

<svelte:head>
    <title>Svelte Advanced Datatable</title>
</svelte:head>

<AppShell slotPageContent="p-12">
    <svelte:fragment slot="header">
        <MainNavbar />
    </svelte:fragment>
    <div class="container mx-auto pt-16 pb-16">
        <div class="mb-24">
            <h1 class="h1 text-5xl lg:text-6xl xl:text-7xl font-light mb-4">Svelte Advanced Datatable</h1>
            <p class="text-xl font-light">
                A highly configurable datatable for Svelte and Sveltestrap UI components (and more soon)
            </p>
        </div>
        <Button href="/docs/getting-started" variant="variant-filled-primary" size="lg">Explore docs</Button>
        <Button href="/api-reference" variant="variant-ringed-primary" size="lg">API Reference</Button>
    </div>
    <svelte:fragment slot="footer">
        <Footer />
    </svelte:fragment>
</AppShell>
