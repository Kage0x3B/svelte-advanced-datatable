<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        pageAmount: number;
        maxDisplayedItems?: number;
        currentPage?: any;
        children: Snippet<[{ createClickHandler: (page: number) => (event: MouseEvent) => void; pages: number[] }]>;
    }

    let { pageAmount, maxDisplayedItems = 5, currentPage = $bindable(-1), children }: Props = $props();

    function navigate(page: number | 'prev' | 'next') {
        if (pageAmount <= 0 || currentPage < 0 || page === currentPage) {
            return;
        }

        if (page === 'prev') {
            page = currentPage - 1;
        } else if (page === 'next') {
            page = currentPage + 1;
        } else if (isNaN(page)) {
            return;
        }

        page = Math.min(Math.max(page as number, 1), pageAmount);
        currentPage = page;
    }

    let pages = $derived(computePages());

    function computePages(): number[] {
        //TODO: Make better pagination which actually respects max items exactly
        if (pageAmount >= 0 && currentPage >= 0) {
            const newPages = [];

            if (pageAmount < maxDisplayedItems) {
                for (let i = 1; i <= pageAmount; i++) {
                    newPages.push(i);
                }
            } else {
                let adjacentPages = Math.floor(maxDisplayedItems / 2 - 1.5);
                adjacentPages = Math.max(1, adjacentPages);

                for (let i = currentPage - adjacentPages - 1; i <= currentPage && i <= pageAmount; i++) {
                    if (i < 1) {
                        continue;
                    }

                    newPages.push(i);
                }

                for (let i = currentPage + 1; i < currentPage + adjacentPages + 1 && i <= pageAmount; i++) {
                    if (i < 1) {
                        continue;
                    }

                    newPages.push(i);
                }

                for (
                    let i = currentPage + adjacentPages + 1;
                    i <= pageAmount && newPages.length < maxDisplayedItems;
                    i++
                ) {
                    newPages.push(i);
                }

                for (let i = newPages[0] - 1; i > 0 && newPages.length < maxDisplayedItems; i--) {
                    newPages.unshift(i);
                }
            }

            return newPages;
        } else {
            return [];
        }
    }

    function createClickHandler(page: number) {
        return (event: MouseEvent) => {
            event.preventDefault();

            navigate(page);
        };
    }
</script>

{@render children({ createClickHandler, pages })}
