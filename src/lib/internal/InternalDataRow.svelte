<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
    import { DATATABLE_CONFIG } from '$lib/util/ContextKey.js';

    const config: FullDataTableConfig<unknown> = getContext(DATATABLE_CONFIG);

    type OnClickFunction = (<T>(item: T) => void | Promise<void>) | undefined;

    interface Props {
        index: number;
        openIndex: number;
        onClick: OnClickFunction;
        item: unknown;
        open: (index: number) => void;
        toggle?: () => void;
        children: Snippet<[{ isOpen: boolean; rowOnClick: OnClickFunction; toggle: () => void }]>;
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

    const isExpandable = !!config.modalComponent;

    let isOpen: boolean = $derived(isExpandable && index === openIndex);

    async function rowOnClick() {
        if (onClick) {
            await onClick(item);
        } else if (isExpandable) {
            toggle();
        }
    }
</script>

{@render children({ isOpen, rowOnClick, toggle })}
