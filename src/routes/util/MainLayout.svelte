<script lang="ts">
    import '../../css/app.css';
    import type { Snippet } from 'svelte';
    import IconGithub from '~icons/fa6-brands/github';
    import Footer from './Footer.svelte';

    interface Props {
        sidebar?: Snippet;
        children: Snippet;
    }

    let { sidebar, children }: Props = $props();
</script>

{#snippet navItems()}
    <li>
        <a href="/docs/getting-started">Documentation</a>
    </li>
    <li>
        <a href="/api-reference">API Reference</a>
    </li>
    <li class="d-flex align-items-center mx-3">
        <a
            href="https://github.com/Kage0x3B/svelte-advanced-datatable"
            target="_blank"
            class="p-0 h-[33px] flex items-center"
        >
            <IconGithub class="size-4 lg:size-6" />
        </a>
    </li>
{/snippet}

<div class="navbar bg-primary fixed z-10">
    <div class="navbar-start">
        <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost md:hidden">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                {@render navItems()}
            </ul>
        </div>
        <a class="btn btn-ghost text-xl" href="/">Svelte Advanced DataTable</a>
    </div>
    <div class="navbar-end hidden md:flex">
        <ul class="menu menu-horizontal px-1">
            {@render navItems()}
        </ul>
    </div>
</div>

<div class="flex flex-col min-h-screen justify-between">
    <div class="flex">
        {#if sidebar}
            <aside class="w-full md:w-1/4 lg:w-1/5 xl:w-1/6 pl-4 pt-8 fixed">
                {@render sidebar()}
            </aside>
            <div class="w-full md:w-1/4 lg:w-1/5 xl:w-1/6 pl-4 pt-8"></div>
        {/if}
        <main class="w-full container mx-auto pt-24 pb-16">{@render children()}</main>
    </div>
    <Footer />
</div>
