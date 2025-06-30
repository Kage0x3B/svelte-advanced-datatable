<script lang="ts">
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import { configContext } from '$lib/util/context.js';
    import type { Snippet } from 'svelte';

    const config = $derived(configContext.get().current);

    type OnClickFunction = (<T>(item: T) => void | Promise<void>) | undefined;

    interface Props {
        state: InternalDataTableState;
        index: number;
        onClick: OnClickFunction;
        item: unknown;
        open: (index: number) => void;
        toggle?: () => void;
        children: Snippet<[{ isOpen: boolean; rowOnClick: OnClickFunction; toggle: () => void }]>;
    }

    let isExpandable = $derived(Boolean(config.modalComponent));

    let {
        state,
        index,
        onClick,
        item,
        open,
        toggle = () => {
            if (isExpandable && item) {
                open(isOpen ? -1 : index);
            }
        },
        children
    }: Props = $props();

    let isOpen: boolean = $derived(isExpandable && index === state.currentOpenIndex);

    async function rowOnClick() {
        if (onClick) {
            await onClick(item);
        } else if (isExpandable) {
            toggle();
        }
    }
</script>

{@render children({ isOpen, rowOnClick, toggle })}
