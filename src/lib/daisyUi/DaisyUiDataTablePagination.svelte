<script lang="ts">
    import ButtonGroup from '$lib/ButtonGroup.svelte';
    import Button from '$lib/Button.svelte';
    import { InternalDataTablePagination } from 'svelte-advanced-datatable/internal';
    import AnglesLeftIcon from '$lib/dataTable/icons/AnglesLeftIcon.svelte';
    import AngleLeftIcon from '$lib/dataTable/icons/AngleLeftIcon.svelte';
    import AngleRightIcon from '$lib/dataTable/icons/AngleRightIcon.svelte';
    import AnglesRightIcon from '$lib/dataTable/icons/AnglesRightIcon.svelte';

    interface Props {
        pageAmount: number;
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
        <ButtonGroup class="flex items-center">
            <Button
                disabled={currentPage === 1}
                on:click={createClickHandler(1)}
                size="sm"
                color="primary"
                btnStyle="outline"
            >
                <AnglesLeftIcon />
            </Button>
            <Button
                disabled={currentPage === 1}
                on:click={createClickHandler('prev')}
                size="sm"
                color="primary"
                btnStyle="outline"
            >
                <AngleLeftIcon />
            </Button>
            {#each pages as page}
                <Button
                    class="{page < 10 ? 'px-4' : ''}"
                    active={page === currentPage}
                    disabled={page === '...'}
                    on:click={createClickHandler(page)}
                    size="sm"
                    color="primary"
                    btnStyle="outline"
                >
                    {page}
                </Button>
            {/each}
            <Button
                disabled={currentPage === pageAmount}
                on:click={createClickHandler('next')}
                size="sm"
                color="primary"
                btnStyle="outline"
            >
                <AngleRightIcon />
            </Button>
            <Button
                disabled={currentPage === pageAmount}
                on:click={createClickHandler(pageAmount)}
                size="sm"
                color="primary"
                btnStyle="outline"
            >
                <AnglesRightIcon />
            </Button>
        </ButtonGroup>
    {/snippet}
</InternalDataTablePagination>
