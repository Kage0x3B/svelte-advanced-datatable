<script lang="ts">
    import DataTable from '$lib/internal/index.js';
    import AnglesLeftIcon from '$lib/daisyUi/icons/AnglesLeftIcon.svelte';
    import AngleLeftIcon from '$lib/daisyUi/icons/AngleLeftIcon.svelte';
    import AngleRightIcon from '$lib/daisyUi/icons/AngleRightIcon.svelte';
    import AnglesRightIcon from '$lib/daisyUi/icons/AnglesRightIcon.svelte';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';

    interface Props {
        state: InternalDataTableState;
        pageAmount: number;
        maxDisplayedItems?: number;
        currentPage: number;
    }

    let { state, pageAmount, maxDisplayedItems = 5, currentPage = $bindable() }: Props = $props();
</script>

<DataTable.Pagination {state} {pageAmount} {maxDisplayedItems} bind:currentPage>
    {#snippet children({ createClickHandler, pages })}
        <div class="join">
            <!-- First-page (<<) and last-page (>>) jumps + the page-number
                 buttons collapse on mobile. Only prev/next remain — they
                 cover 99 % of mobile pagination and keep the toolbar tight.
                 The `max-md:!rounded-l-lg` / `-r-lg` overrides re-add the
                 outer rounding to the now-edge prev/next buttons (DaisyUI's
                 join `:first-child` / `:last-child` rules still target the
                 hidden buttons structurally). -->
            <button
                disabled={currentPage === 1}
                onclick={createClickHandler(1)}
                class="btn join-item btn-sm btn-primary btn-outline hidden md:inline-flex"
            >
                <AnglesLeftIcon />
            </button>
            <button
                disabled={currentPage === 1}
                onclick={createClickHandler('prev')}
                class="btn join-item btn-sm btn-primary btn-outline max-md:!rounded-l-lg"
            >
                <AngleLeftIcon />
            </button>
            {#each pages as page}
                <button
                    disabled={page === -1}
                    onclick={createClickHandler(page)}
                    class="{page < 10 ? 'px-4' : ''} btn {page === currentPage
                        ? 'btn-active'
                        : ''} join-item btn-sm btn-primary btn-outline hidden md:inline-flex"
                >
                    {page}
                </button>
            {/each}
            <button
                disabled={currentPage === pageAmount}
                onclick={createClickHandler('next')}
                class="btn join-item btn-sm btn-primary btn-outline max-md:!rounded-r-lg"
            >
                <AngleRightIcon />
            </button>
            <button
                disabled={currentPage === pageAmount}
                onclick={createClickHandler(pageAmount)}
                class="btn join-item btn-sm btn-primary btn-outline hidden md:inline-flex"
            >
                <AnglesRightIcon />
            </button>
        </div>
    {/snippet}
</DataTable.Pagination>
