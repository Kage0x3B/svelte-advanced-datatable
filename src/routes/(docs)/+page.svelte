<script lang="ts">
    import Button from '../util/Button.svelte';
    import MainLayout from '../util/MainLayout.svelte';
</script>

<svelte:head>
    <title>Svelte Advanced DataTable</title>
</svelte:head>

<MainLayout>
    <div class="prose *:no-underline">
        <div class="mb-24">
            <h1 class="h1 text-5xl lg:text-6xl xl:text-7xl mb-4">Svelte Advanced DataTable</h1>
            <p class="text-xl font-light">
                A highly configurable dataTable for Svelte and Sveltestrap UI components (and more soon)
            </p>
        </div>
        <Button href="/docs/getting-started" color="primary" size="lg">Explore docs</Button>
        <Button href="/api-reference" color="primary" size="lg">API Reference</Button>
    </div>
</MainLayout>
