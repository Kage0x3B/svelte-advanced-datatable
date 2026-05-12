<script lang="ts">
    import type { DataTableAction } from '$lib/types/DataTableAction.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import {
        actionRunnerContext,
        configContext,
        dataSourceContext,
        messageFormatterContext,
        selectionContext
    } from '$lib/util/context.js';
    import { groupActions, resolveActionLabel } from '$lib/util/actionLabelUtil.js';
    import { attachDetailsAutoClose } from '$lib/util/detailsAutoClose.svelte.js';
    import MoreVerticalIcon from '$lib/daisyUi/icons/MoreVerticalIcon.svelte';
    import XIcon from '$lib/daisyUi/icons/XIcon.svelte';
    import { fade } from 'svelte/transition';

    const selection = $derived(selectionContext.get().current);
    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const runner = $derived(actionRunnerContext.get().current);
    const dataSource = $derived(dataSourceContext.get().current);

    /** Subset of the current selection that is also loaded into the active
     * page — passed to `isDisabled` so a predicate can inspect whatever rows
     * the consumer can actually see (cross-page selections only contribute
     * `ids`). Mirrors the shape produced by `onSelectionChange.loadedItems`. */
    const loadedSelectedItems = $derived.by(() => {
        const items = (dataSource.queryResult.data?.items ?? []) as Record<string, unknown>[];
        if (selection.count === 0) return [] as Record<string, unknown>[];
        const idSet = new Set(selection.ids);
        return items.filter((item) =>
            idSet.has(item[config.dataUniquePropertyKey] as SelectionId)
        );
    });

    /** Bulk-eligible actions — only those with an `onMulti` handler and not
     * hidden in bulk context. The user opted into ID-only handlers, so
     * single-item actions never appear in the toolbar. */
    const bulkActions = $derived(
        (config.actions as DataTableAction<Record<string, unknown>>[])
            .filter((action) => !action.hideInBulk)
            .filter((action) => action.onMulti !== undefined)
    );

    /** First N primary actions render as standalone buttons. Anything past
     * the cap, plus all non-primary actions, fall into the "More" overflow
     * dropdown — same precedence as the user's spec. */
    const primaryCap = $derived(config.selection.primaryActionsCount ?? 2);

    const primaryButtons = $derived(
        bulkActions.filter((action) => action.primary === true).slice(0, primaryCap)
    );

    const overflowActions = $derived(
        bulkActions.filter((action) => !primaryButtons.includes(action))
    );

    const overflowSections = $derived(groupActions(overflowActions, format));

    /** Toolbar visibility — driven entirely by the selection count, not by
     * `selectionEnabled`, so a consumer who hides the chrome but binds
     * `selectedIds` for a custom UI doesn't see this surface. */
    const visible = $derived(selection.count > 0 && bulkActions.length > 0);

    const selectedCountLabel = $derived(
        resolveActionLabel(config, format, 'selectedCount', `${selection.count} selected`, {
            count: selection.count
        })
    );
    const moreActionsLabel = $derived(
        resolveActionLabel(config, format, 'moreActions', 'More actions')
    );
    const clearSelectionLabel = $derived(
        resolveActionLabel(config, format, 'clearSelection', 'Clear selection')
    );

    let overflowDetailsEl: HTMLDetailsElement | undefined = $state();

    $effect(() => attachDetailsAutoClose(overflowDetailsEl));

    function variantBtnClass(variant: DataTableAction<Record<string, unknown>>['variant']): string {
        switch (variant) {
            case 'destructive':
                return 'btn btn-error btn-sm';
            case 'primary':
                return 'btn btn-primary btn-sm';
            default:
                return 'btn btn-ghost btn-sm';
        }
    }

    function variantMenuClass(variant: DataTableAction<Record<string, unknown>>['variant']): string {
        switch (variant) {
            case 'destructive':
                return 'text-error';
            case 'primary':
                return 'text-primary';
            default:
                return '';
        }
    }

    function disabledReasonFor(
        action: DataTableAction<Record<string, unknown>>
    ): string | false {
        return (
            action.isDisabled?.({
                kind: 'bulk',
                ids: selection.ids,
                loadedItems: loadedSelectedItems
            }) ?? false
        );
    }

    async function invoke(
        action: DataTableAction<Record<string, unknown>>,
        disabledReason: string | false
    ): Promise<void> {
        if (disabledReason !== false) return;
        overflowDetailsEl?.removeAttribute('open');
        await runner.invoke(action, { kind: 'bulk', ids: selection.ids });
    }
</script>

{#if visible}
    <div
        class="datatable-selection-toolbar bg-base-200 flex flex-wrap items-center gap-2 rounded-md px-2 py-1"
        role="region"
        aria-label="Selection actions"
        in:fade|local={{ duration: 120 }}
        out:fade|local={{ duration: 80 }}
    >
        <span class="text-sm font-medium whitespace-nowrap">{selectedCountLabel}</span>

        {#each primaryButtons as action (action.key)}
            {@const label = resolveActionLabel(config, format, action.key, action.key)}
            {@const Icon = action.icon}
            {@const disabledReason = disabledReasonFor(action)}
            {@const isDisabled = disabledReason !== false}
            <button
                type="button"
                class={variantBtnClass(action.variant)}
                disabled={isDisabled}
                aria-disabled={isDisabled || undefined}
                onclick={() => invoke(action, disabledReason)}
                aria-label={isDisabled ? `${label} — ${disabledReason}` : label}
                title={isDisabled ? disabledReason : label}
            >
                {#if Icon}
                    <span class="action-icon" aria-hidden="true"><Icon /></span>
                {/if}
                <span class="hidden sm:inline">{label}</span>
            </button>
        {/each}

        {#if overflowActions.length > 0}
            <details
                bind:this={overflowDetailsEl}
                name="datatable-selection-overflow"
                class="dropdown dropdown-end"
            >
                <summary
                    class="btn btn-ghost btn-sm"
                    aria-label={moreActionsLabel}
                    aria-haspopup="menu"
                >
                    <span class="hidden sm:inline">{moreActionsLabel}</span>
                    <span class="sm:hidden inline-flex action-icon" aria-hidden="true">
                        <MoreVerticalIcon />
                    </span>
                </summary>
                <ul class="menu dropdown-content bg-base-100 rounded-box z-50 mt-1 w-52 p-2 shadow">
                    {#each overflowSections as section, sectionIndex (section.label ?? '__ungrouped__')}
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
                                    class={variantMenuClass(action.variant)}
                                    disabled={isDisabled}
                                    title={isDisabled ? disabledReason : undefined}
                                    aria-disabled={isDisabled || undefined}
                                    onclick={() => invoke(action, disabledReason)}
                                >
                                    {#if Icon}
                                        <span class="action-icon" aria-hidden="true"><Icon /></span>
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
            </details>
        {/if}

        <button
            type="button"
            class="btn btn-ghost btn-sm btn-square"
            onclick={() => selection.clear()}
            aria-label={clearSelectionLabel}
            title={clearSelectionLabel}
        >
            <XIcon />
        </button>
    </div>
{/if}

<style>
    .action-icon {
        display: inline-flex;
        width: 1rem;
        justify-content: center;
    }

    /* Drop the native disclosure marker so <summary> looks like a plain btn. */
    .datatable-selection-toolbar :global(summary) {
        list-style: none;
    }
    .datatable-selection-toolbar :global(summary::-webkit-details-marker) {
        display: none;
    }
</style>
