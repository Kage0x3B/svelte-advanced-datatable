<script>
    import { Pagination, PaginationItem } from 'skeleton';
    import PaginationLink from './SkeletonPaginationLink.svelte';
    import InternalDataTablePagination from '$lib/internal/InternalDataTablePagination.svelte';

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
    <Pagination listClassName="m-0">
        <PaginationItem disabled={currentPage === 1}>
            <PaginationLink first on:click={createClickHandler(1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === 1}>
            <PaginationLink on:click={createClickHandler('prev')} previous />
        </PaginationItem>
        {#each pages as page}
            <PaginationItem active={page === currentPage} disabled={page === '...'}>
                <PaginationLink on:click={createClickHandler(page)}
                    ><span class:px-1={page < 10}>{page}</span>
                </PaginationLink>
            </PaginationItem>
        {/each}
        <PaginationItem disabled={currentPage === pageAmount}>
            <PaginationLink next on:click={createClickHandler('next')} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === pageAmount}>
            <PaginationLink last on:click={createClickHandler(pageAmount)} />
        </PaginationItem>
    </Pagination>
</InternalDataTablePagination>
