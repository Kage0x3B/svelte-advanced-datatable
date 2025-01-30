<script lang="ts">
    import InternalDataTablePagination from '$lib/internal/InternalDataTablePagination.svelte';
    import SkeletonPaginationButton from '$lib/skeleton/SkeletonPaginationButton.svelte';

    interface Props {
        pageAmount: any;
        maxDisplayedItems?: number;
        currentPage?: any;
    }

    let { pageAmount, maxDisplayedItems = 5, currentPage = $bindable(-1) }: Props = $props();
</script>

<InternalDataTablePagination
    
    
    {pageAmount}
    {maxDisplayedItems}
    bind:currentPage
    on:navigate
>
    {#snippet children({ createClickHandler, pages })}
        <div class="flex flex-row">
            <SkeletonPaginationButton disabled={currentPage === 1} first on:click={createClickHandler(1)} />
            <SkeletonPaginationButton disabled={currentPage === 1} previous on:click={createClickHandler('prev')} />
            {#each pages as page}
                <SkeletonPaginationButton
                    active={page === currentPage}
                    disabled={page === '...'}
                    on:click={createClickHandler(page)}
                >
                    <span class:px-1={page < 10}>{page}</span>
                </SkeletonPaginationButton>
            {/each}
            <SkeletonPaginationButton disabled={currentPage === pageAmount} next on:click={createClickHandler('next')} />
            <SkeletonPaginationButton
                disabled={currentPage === pageAmount}
                last
                on:click={createClickHandler(pageAmount)}
            />
        </div>
    {/snippet}
</InternalDataTablePagination>
