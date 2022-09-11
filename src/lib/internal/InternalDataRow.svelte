<script lang='ts'>
	import type { MaybePromise } from '$lib/types';
	import { getContext } from 'svelte';
	import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
	import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';

	const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);

	export let index: number;
	export let openIndex: number;

	export let onClick: (<T>(item: T) => MaybePromise<void>) | undefined;
	export let item: unknown;
	export let open: (index: number) => void;

	const isExpandable = !!config.modalComponent;

	let isOpen: boolean;
	$: isOpen = isExpandable && index === openIndex;

	export let toggle: () => void = () => {
		isExpandable && item && open(isOpen ? -1 : index);
	};

	async function rowOnClick() {
		if (onClick) {
			await onClick(item);
		} else if (isExpandable) {
			toggle();
		}
	}
</script>

<slot {isOpen} {rowOnClick} {toggle} />
