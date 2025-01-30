<script lang='ts'>
	import type { MaybePromise } from '$lib/types';
	import { getContext } from 'svelte';
	import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
	import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';

	const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);



	const isExpandable = !!config.modalComponent;

	let isOpen: boolean = $derived(isExpandable && index === openIndex);

	interface Props {
		index: number;
		openIndex: number;
		onClick: (<T>(item: T) => MaybePromise<void>) | undefined;
		item: unknown;
		open: (index: number) => void;
		toggle?: () => void;
		children?: import('svelte').Snippet<[any]>;
	}

	let {
		index,
		openIndex,
		onClick,
		item,
		open,
		toggle = () => {
		isExpandable && item && open(isOpen ? -1 : index);
	},
		children
	}: Props = $props();

	async function rowOnClick() {
		if (onClick) {
			await onClick(item);
		} else if (isExpandable) {
			toggle();
		}
	}
	
</script>

{@render children?.({ isOpen, rowOnClick, toggle, })}
