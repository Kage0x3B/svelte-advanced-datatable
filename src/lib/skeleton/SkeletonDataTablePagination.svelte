<script>
    import InternalDataTablePagination from '$lib/internal/InternalDataTablePagination.svelte';
    import SkeletonPaginationButton from '$lib/skeleton/SkeletonPaginationButton.svelte';

    export let pageAmount;
    export let maxDisplayedItems = 5;
    export let currentPage = -1;
</script>

<InternalDataTablePagination
    let:createClickHandler
    let:pages
    {pageAmount}
    {maxDisplayedItems}
    bind:currentPage
    on:navigate
>
    <div class="btn-group variant-filled-surface">
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
</InternalDataTablePagination>
