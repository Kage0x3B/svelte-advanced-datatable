<script lang="ts">
    import type { ContextMenuInvocation, ContextMenuState } from '$lib/internal/contextMenuState.svelte.js';
    import type { DataTableAction } from '$lib/types/DataTableAction.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import {
        actionRunnerContext,
        configContext,
        contextMenuContext,
        messageFormatterContext
    } from '$lib/util/context.js';
    import { groupActions, resolveActionLabel } from '$lib/util/actionLabelUtil.js';
    import type { Snippet } from 'svelte';

    type Item = Record<string, unknown>;

    interface ExtraSnippetArgs {
        kind: 'row' | 'bulk';
        item?: Item;
        id?: SelectionId;
        ids: SelectionId[];
        loadedItems: Item[];
        close: () => void;
    }

    interface Props {
        extra?: Snippet<[ExtraSnippetArgs]>;
    }

    let { extra }: Props = $props();

    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const runner = $derived(actionRunnerContext.get().current);
    const menu = $derived(contextMenuContext.get().current as unknown as ContextMenuState<Item>);
    const invocation = $derived(menu.invocation as ContextMenuInvocation<Item> | null);

    /** Args passed to the optional `extra` snippet. Normalises the
     * invocation's row vs bulk shapes into one record so the consumer can
     * destructure once regardless of which path opened the menu. */
    const extraArgs = $derived.by<ExtraSnippetArgs | null>(() => {
        const inv = invocation;
        if (!inv) return null;
        if (inv.kind === 'row') {
            return {
                kind: 'row',
                item: inv.item,
                id: inv.id,
                ids: [inv.id],
                loadedItems: [inv.item],
                close: () => menu.close()
            };
        }
        return {
            kind: 'bulk',
            ids: inv.ids,
            loadedItems: inv.loadedItems,
            close: () => menu.close()
        };
    });

    /** Action set for the active invocation. Row-context filters mirror
     * `DaisyUiRowActionsCell` (hideInRow / has handler / rowVisible),
     * bulk-context filters mirror `DaisyUiSelectionToolbar` (hideInBulk /
     * has onMulti). Empty list short-circuits the render below. */
    const actions = $derived.by(() => {
        const inv = invocation;
        if (!inv) return [] as DataTableAction<Item>[];
        const all = config.actions as DataTableAction<Item>[];
        if (inv.kind === 'row') {
            const item = inv.item;
            return all
                .filter((a) => !a.hideInRow)
                .filter((a) => a.onSingle || a.onMulti)
                .filter((a) => a.rowVisible?.(item) ?? true);
        }
        return all.filter((a) => !a.hideInBulk).filter((a) => a.onMulti !== undefined);
    });

    const sections = $derived(groupActions(actions, format));

    /** Resolved DOM size of the menu, measured after mount so the position
     * effect can flip the menu off the right/bottom edges of the viewport
     * when the cursor was near them. */
    let menuEl = $state<HTMLDivElement | undefined>(undefined);
    let menuWidth = $state(208); // sensible default until measured (matches w-52)
    let menuHeight = $state(160);

    $effect(() => {
        if (!menu.open || !menuEl) return;
        const rect = menuEl.getBoundingClientRect();
        menuWidth = rect.width;
        menuHeight = rect.height;
    });

    /** Clamped position — viewport edges win over the click coordinates so
     * the menu never renders off-screen. 8px gutter on every side. */
    const position = $derived.by(() => {
        if (!menu.open) return { left: 0, top: 0 };
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
        const left = Math.min(menu.x, vw - menuWidth - 8);
        const top = Math.min(menu.y, vh - menuHeight - 8);
        return { left: Math.max(8, left), top: Math.max(8, top) };
    });

    /** Dismiss on outside-click, scroll, resize, and Escape. Effects run
     * only while open so the listeners cost nothing in the steady state. */
    $effect(() => {
        if (!menu.open) return;
        function onPointerDown(event: PointerEvent): void {
            if (menuEl && event.target instanceof Node && menuEl.contains(event.target)) return;
            menu.close();
        }
        function onKeydown(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                menu.close();
                event.preventDefault();
            }
        }
        function onScrollOrResize(): void {
            menu.close();
        }
        window.addEventListener('pointerdown', onPointerDown, true);
        window.addEventListener('keydown', onKeydown, true);
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            window.removeEventListener('pointerdown', onPointerDown, true);
            window.removeEventListener('keydown', onKeydown, true);
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    });

    function variantClass(variant: DataTableAction<Record<string, unknown>>['variant']): string {
        switch (variant) {
            case 'destructive':
                return 'text-error';
            case 'primary':
                return 'text-primary';
            default:
                return '';
        }
    }

    function disabledReasonFor(action: DataTableAction<Item>): string | false {
        const inv = invocation;
        if (!inv) return false;
        if (inv.kind === 'row') {
            return action.isDisabled?.({ kind: 'row', item: inv.item }) ?? false;
        }
        return (
            action.isDisabled?.({
                kind: 'bulk',
                ids: inv.ids,
                loadedItems: inv.loadedItems
            }) ?? false
        );
    }

    async function onActionClick(
        action: DataTableAction<Item>,
        disabledReason: string | false
    ): Promise<void> {
        if (disabledReason !== false) return;
        const inv = invocation;
        menu.close();
        if (!inv) return;
        if (inv.kind === 'row') {
            await runner.invoke(action, { kind: 'row', item: inv.item, id: inv.id });
        } else {
            await runner.invoke(action, { kind: 'bulk', ids: inv.ids });
        }
    }
</script>

{#if menu.open && (actions.length > 0 || (extra && extraArgs))}
    <div
        bind:this={menuEl}
        class="datatable-context-menu fixed z-50"
        style:left="{position.left}px"
        style:top="{position.top}px"
        role="menu"
    >
        <ul class="menu bg-base-100 rounded-box w-52 p-2 shadow">
            {#if extra && extraArgs}
                {@render extra(extraArgs)}
                {#if actions.length > 0}
                    <li><hr class="border-base-content/10 my-1" /></li>
                {/if}
            {/if}
            {#each sections as section, sectionIndex (section.label ?? '__ungrouped__')}
                {#if section.label !== null}
                    <li class="menu-title">
                        <span>{section.label}</span>
                    </li>
                {:else if sectionIndex > 0}
                    <li><hr class="border-base-content/10 my-1" /></li>
                {/if}
                {#each section.actions as action (action.key)}
                    {@const label = resolveActionLabel(config, format, action.key, action.key)}
                    {@const Icon = action.icon}
                    {@const disabledReason = disabledReasonFor(action)}
                    {@const isDisabled = disabledReason !== false}
                    <li class:disabled={isDisabled}>
                        <button
                            type="button"
                            class={variantClass(action.variant)}
                            disabled={isDisabled}
                            title={isDisabled ? disabledReason : undefined}
                            aria-disabled={isDisabled || undefined}
                            onclick={() => onActionClick(action, disabledReason)}
                        >
                            {#if Icon}
                                <span class="action-icon" aria-hidden="true">
                                    <Icon />
                                </span>
                            {/if}
                            <span>{label}</span>
                            {#if isDisabled}
                                <span class="sr-only">({disabledReason})</span>
                            {/if}
                        </button>
                    </li>
                {/each}
            {/each}
        </ul>
    </div>
{/if}

<style>
    .action-icon {
        display: inline-flex;
        width: 1rem;
        justify-content: center;
    }
</style>
