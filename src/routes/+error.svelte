<script lang="ts">
    import { page } from '$app/stores';
    import '../css/app.pcss';
    import { AppShell } from '@skeletonlabs/skeleton';
    import MainNavbar from './util/MainNavbar.svelte';

    $: message =
        $page.status === 404
            ? "We couldn't find the page you were looking for!"
            : $page.error?.message ?? 'An error occurred';
</script>

<AppShell slotPageContent="p-4">
    <svelte:fragment slot="header">
        <MainNavbar />
    </svelte:fragment>
    <slot />
</AppShell>

<slot />

<div class="flex flex-col justify-center items-center min-h-[60vh]">
    <h1 class="mb-5 text-primary-500">
        {$page.status}
    </h1>
    <h2 class="text-surface-500">{message}</h2>
    <h3>
        <a href="/">Go back to the homepage</a>
    </h3>
</div>

<style>
    h1 {
        font-size: 6rem;
        font-weight: 600;
        text-shadow:
            0 3px 0 #b2a98f,
            0 14px 10px rgba(0, 0, 0, 0.15),
            0 24px 2px rgba(0, 0, 0, 0.1),
            0 34px 30px rgba(0, 0, 0, 0.1);
    }

    a {
        text-decoration: none;
    }
</style>
