<script lang="ts">
    import { configContext } from '$lib/util/context.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { Snippet } from 'svelte';
    import SettingsIcon from './icons/SettingsIcon.svelte';
    import XIcon from './icons/XIcon.svelte';

    interface Props {
        state: InternalDataTableState;
        children?: Snippet;
    }

    let { state: _state, children }: Props = $props();
    const config = $derived(configContext.get().current);

    let triggerEl: HTMLButtonElement | undefined = $state();
    let popoverEl: HTMLDivElement | undefined = $state();

    /**
     * Position the popover next to the trigger button on desktop. Mobile
     * placement is handled by the CSS media query, which centres the card
     * over a backdrop with horizontal and vertical breathing room.
     */
    function positionForDesktop() {
        if (!triggerEl || !popoverEl) return;
        const rect = triggerEl.getBoundingClientRect();
        const popoverWidth = popoverEl.offsetWidth || 280;
        const margin = 8;

        // Anchor below the trigger, right-aligned so the popover doesn't
        // overflow off-screen on the typical "settings on the right" layout.
        let top = rect.bottom + margin;
        let left = rect.right - popoverWidth;
        if (left < margin) left = margin;
        if (left + popoverWidth + margin > window.innerWidth) {
            left = window.innerWidth - popoverWidth - margin;
        }
        // Flip above the trigger if there's no room below.
        const popoverHeight = popoverEl.offsetHeight || 320;
        if (top + popoverHeight + margin > window.innerHeight && rect.top - popoverHeight - margin >= 0) {
            top = rect.top - popoverHeight - margin;
        }

        popoverEl.style.top = `${top}px`;
        popoverEl.style.left = `${left}px`;
    }

    function isMobileViewport(): boolean {
        return typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches;
    }

    function handleToggle(event: ToggleEvent) {
        if (event.newState !== 'open') return;
        if (isMobileViewport()) {
            // Mobile: clear inline coords so the CSS media query takes over.
            if (popoverEl) {
                popoverEl.style.top = '';
                popoverEl.style.left = '';
            }
        } else {
            positionForDesktop();
        }
    }

    function open() {
        if (!popoverEl) return;
        popoverEl.showPopover();
    }

    function close() {
        if (!popoverEl) return;
        popoverEl.hidePopover();
    }
</script>

<svelte:window
    onresize={() => {
        if (popoverEl?.matches(':popover-open') && !isMobileViewport()) positionForDesktop();
    }}
/>

<button
    bind:this={triggerEl}
    type="button"
    class="btn btn-ghost btn-sm btn-circle"
    aria-label={`Settings for table ${config.type}`}
    onclick={open}
>
    <SettingsIcon class="size-4" />
</button>

<div
    bind:this={popoverEl}
    popover="auto"
    role="dialog"
    aria-modal="true"
    aria-label="Table settings"
    class="datatable-settings-popover"
    ontoggle={handleToggle}
>
    <div class="datatable-settings-card card bg-base-100 shadow-xl border border-base-300">
        <div class="datatable-settings-mobile-header md:hidden flex items-center justify-between px-4 py-3 border-b border-base-300">
            <span class="font-semibold">Settings</span>
            <button type="button" class="btn btn-ghost btn-sm btn-circle" aria-label="Close settings" onclick={close}>
                <XIcon class="size-3" />
            </button>
        </div>
        <div class="datatable-settings-body card-body gap-4 p-4">
            {@render children?.()}
        </div>
    </div>
</div>

<style>
    /* Reset native dialog/popover defaults that fight DaisyUI styling. */
    .datatable-settings-popover {
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        overflow: visible;
        max-width: none;
        max-height: none;
    }

    .datatable-settings-popover::backdrop {
        background: transparent;
        transition: background 150ms ease;
    }

    /* Desktop: positioned via JS (top/left). Card sized to its content. */
    .datatable-settings-popover {
        position: fixed;
        width: max-content;
        min-width: 18rem;
        max-width: min(20rem, calc(100vw - 1rem));
    }

    .datatable-settings-card {
        width: 100%;
    }

    .datatable-settings-mobile-header {
        display: none;
    }

    /* Mobile: card centred over a darkened backdrop with breathing room on
       all sides. Not full-screen — the user's content underneath stays
       visually framed. */
    @media (max-width: 767.98px) {
        .datatable-settings-popover {
            inset: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100vw - 2rem);
            max-width: 24rem;
            max-height: calc(100vh - 4rem);
            display: flex;
            flex-direction: column;
        }

        .datatable-settings-popover::backdrop {
            background: rgb(0 0 0 / 50%);
        }

        .datatable-settings-card {
            display: flex;
            flex-direction: column;
            max-height: 100%;
        }

        .datatable-settings-mobile-header {
            display: flex;
        }

        .datatable-settings-body {
            overflow-y: auto;
        }
    }
</style>
