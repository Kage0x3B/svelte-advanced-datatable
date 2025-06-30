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
            <button
                disabled={currentPage === 1}
                onclick={createClickHandler(1)}
                class="btn join-item btn-sm btn-primary btn-outline"
            >
                <AnglesLeftIcon />
            </button>
            <button
                disabled={currentPage === 1}
                onclick={createClickHandler('prev')}
                class="btn join-item btn-sm btn-primary btn-outline"
            >
                <AngleLeftIcon />
            </button>
            {#each pages as page}
                <button
                    disabled={page === -1}
                    onclick={createClickHandler(page)}
                    class="{page < 10 ? 'px-4' : ''} btn {page === currentPage
                        ? 'btn-active'
                        : ''} join-item btn-sm btn-primary btn-outline"
                >
                    {page}
                </button>
            {/each}
            <button
                disabled={currentPage === pageAmount}
                onclick={createClickHandler('next')}
                class="btn join-item btn-sm btn-primary btn-outline"
            >
                <AngleRightIcon />
            </button>
            <button
                disabled={currentPage === pageAmount}
                onclick={createClickHandler(pageAmount)}
                class="btn join-item btn-sm btn-primary btn-outline"
            >
                <AnglesRightIcon />
            </button>
        </div>
    {/snippet}
</DataTable.Pagination>
