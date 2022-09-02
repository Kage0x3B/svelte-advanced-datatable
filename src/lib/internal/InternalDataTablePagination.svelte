<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let pageAmount;
	export let maxDisplayedItems = 5;
	export let currentPage = -1;

	function navigate(page) {
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

		page = Math.min(Math.max(page, 1), pageAmount);
		currentPage = page;
		dispatch('navigate', { page });
	}

	let pages;
	$: {
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

				for (let i = currentPage + adjacentPages + 1; i <= pageAmount && newPages.length < maxDisplayedItems; i++) {
					newPages.push(i);
				}

				for (let i = newPages[0] - 1; i > 0 && newPages.length < maxDisplayedItems; i--) {
					newPages.unshift(i);
				}
			}

			pages = newPages;
		} else {
			pages = ['...'];
		}
	}

	function createClickHandler(page) {
		return function(event) {
			event.preventDefault();

			navigate(page);
		};
	}
</script>

<slot {createClickHandler} {pages} />
