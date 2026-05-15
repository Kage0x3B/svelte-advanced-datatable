<script lang="ts">
    import DataTable from '$lib/internal/index.js';
    import AnglesLeftIcon from '$lib/daisyUi/icons/AnglesLeftIcon.svelte';
    import AngleLeftIcon from '$lib/daisyUi/icons/AngleLeftIcon.svelte';
    import AngleRightIcon from '$lib/daisyUi/icons/AngleRightIcon.svelte';
    import AnglesRightIcon from '$lib/daisyUi/icons/AnglesRightIcon.svelte';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import { messageFormatterContext } from '$lib/util/context.js';

    interface Props {
        state: InternalDataTableState;
        pageAmount: number;
        maxDisplayedItems?: number;
        currentPage: number;
    }

    let { state, pageAmount, maxDisplayedItems = 5, currentPage = $bindable() }: Props = $props();

    const format = $derived(messageFormatterContext.get().current);
    const firstLabel = $derived(format('pagination.first', { default: 'First page' }));
    const previousLabel = $derived(format('pagination.previous', { default: 'Previous page' }));
    const nextLabel = $derived(format('pagination.next', { default: 'Next page' }));
    const lastLabel = $derived(format('pagination.last', { default: 'Last page' }));
    const goToPageLabel = (page: number): string =>
        format('pagination.goToPage', { default: `Go to page ${page}`, values: { page } }) ??
        `Go to page ${page}`;
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
                aria-label={firstLabel}
                disabled={currentPage === 1}
                onclick={createClickHandler(1)}
                class="btn join-item btn-sm btn-primary btn-outline hidden md:inline-flex"
            >
                <span aria-hidden="true"><AnglesLeftIcon /></span>
            </button>
            <button
                aria-label={previousLabel}
                disabled={currentPage === 1}
                onclick={createClickHandler('prev')}
                class="btn join-item btn-sm btn-primary btn-outline max-md:!rounded-l-lg"
            >
                <span aria-hidden="true"><AngleLeftIcon /></span>
            </button>
            {#each pages as page}
                <button
                    aria-label={page === -1 ? undefined : goToPageLabel(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
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
                aria-label={nextLabel}
                disabled={currentPage === pageAmount}
                onclick={createClickHandler('next')}
                class="btn join-item btn-sm btn-primary btn-outline max-md:!rounded-r-lg"
            >
                <span aria-hidden="true"><AngleRightIcon /></span>
            </button>
            <button
                aria-label={lastLabel}
                disabled={currentPage === pageAmount}
                onclick={createClickHandler(pageAmount)}
                class="btn join-item btn-sm btn-primary btn-outline hidden md:inline-flex"
            >
                <span aria-hidden="true"><AnglesRightIcon /></span>
            </button>
        </div>
    {/snippet}
</DataTable.Pagination>
