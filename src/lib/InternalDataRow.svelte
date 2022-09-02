<script lang='ts'>
	import type { MaybePromise } from '$lib/types';
	import type { DataRecord } from './types/DataRecord.js';

	export let index: number;
	export let openIndex: number;

	export let onClick: (<T>(item: T) => MaybePromise<void>) | undefined;
	export let modalComponent;
	export let item: DataRecord;
	export let open: (index: number) => void;

	const isExpandable = !!modalComponent;

	let isOpen: boolean;
	$: isOpen = isExpandable && index === openIndex;

	export const toggle: () => void = () => isExpandable && item && open(isOpen ? -1 : index);

	async function rowOnClick() {
		if (onClick) {
			await onClick(item);
		} else if (isExpandable) {
			toggle();
		}
	}
</script>

<slot {isOpen} onClick={rowOnClick} {toggle} />
