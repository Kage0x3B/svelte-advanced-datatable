<script lang="ts">
    import Footer from '../util/Footer.svelte';
    import Button from '../util/Button.svelte';
    import MainLayout from '../util/MainLayout.svelte';
</script>

<svelte:head>
    <title>Svelte Advanced DataTable</title>
</svelte:head>

<AppShell slotPageContent="p-12">
    {#snippet header()}
        <MainLayout />
    {/snippet}
    <div class="container mx-auto pt-16 pb-16">
        <div class="mb-24">
            <h1 class="h1 text-5xl lg:text-6xl xl:text-7xl font-light mb-4">Svelte Advanced DataTable</h1>
            <p class="text-xl font-light">
                A highly configurable dataTable for Svelte and Sveltestrap UI components (and more soon)
            </p>
        </div>
        <Button href="/docs/getting-started" variant="variant-filled-primary" size="lg">Explore docs</Button>
        <Button href="/api-reference" variant="variant-ringed-primary" size="lg">API Reference</Button>
    </div>
    {#snippet footer()}
        <Footer />
    {/snippet}
</AppShell>
