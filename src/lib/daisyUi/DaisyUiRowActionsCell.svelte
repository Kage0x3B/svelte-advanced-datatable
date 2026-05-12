<script lang="ts">
    import type { DataTableAction } from '$lib/types/DataTableAction.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import {
        actionRunnerContext,
        configContext,
        messageFormatterContext
    } from '$lib/util/context.js';
    import { resolveActionLabel } from '$lib/util/actionLabelUtil.js';
    import { attachDetailsAutoClose } from '$lib/util/detailsAutoClose.svelte.js';
    import MoreVerticalIcon from '$lib/daisyUi/icons/MoreVerticalIcon.svelte';

    interface Props {
        item: Record<string, unknown>;
    }

    let { item }: Props = $props();

    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const runner = $derived(actionRunnerContext.get().current);

    const id = $derived(item[config.dataUniquePropertyKey] as SelectionId);

    /** Actions available for this specific row. Filters out:
     *  - actions explicitly hidden in row context
     *  - actions with no executable handler (neither onSingle nor onMulti)
     *  - actions whose `rowVisible` predicate excludes this row */
    const rowActions = $derived(
        (config.actions as DataTableAction<Record<string, unknown>>[])
            .filter((action) => !action.hideInRow)
            .filter((action) => action.onSingle || action.onMulti)
            .filter((action) => action.rowVisible?.(item) ?? true)
    );

    const triggerAriaLabel = $derived(resolveActionLabel(config, format, 'rowActions', 'Actions'));

    /** Native <details> dropdown — closing it requires removing the `open`
     * attribute. Bound so each menu-item click can both invoke the handler
     * and dismiss the dropdown. */
    let detailsEl: HTMLDetailsElement | undefined = $state();

    $effect(() => attachDetailsAutoClose(detailsEl));

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

    async function onActionClick(
        action: DataTableAction<Record<string, unknown>>,
        disabledReason: string | false
    ): Promise<void> {
        if (disabledReason !== false) return;
        detailsEl?.removeAttribute('open');
        await runner.invoke(action, { kind: 'row', item, id });
    }

    /** Stop the row's onclick (modal toggle / navigation) from firing when
     * the user opens the dropdown. */
    function onCellClick(event: MouseEvent): void {
        event.stopPropagation();
    }
</script>

<td class="datatable-row-actions-td" onclick={onCellClick}>
    {#if rowActions.length > 0}
        <details
            bind:this={detailsEl}
            name="datatable-row-actions"
            class="dropdown dropdown-end"
        >
            <summary
                class="btn btn-ghost btn-sm btn-square"
                aria-label={triggerAriaLabel}
                aria-haspopup="menu"
            >
                <MoreVerticalIcon />
            </summary>
            <ul class="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow">
                {#each rowActions as action (action.key)}
                    {@const label = resolveActionLabel(config, format, action.key, action.key)}
                    {@const Icon = action.icon}
                    {@const disabledReason = action.isDisabled?.({ kind: 'row', item }) ?? false}
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
                                <span class="row-action-icon" aria-hidden="true">
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
            </ul>
        </details>
    {/if}
</td>

<style>
    /* `overflow: visible` overrides the table-wide `td { overflow: hidden }`
     * rule so the absolute-positioned dropdown isn't clipped by its host
     * cell. The cell itself has fixed width / centred icon. */
    .datatable-row-actions-td {
        width: 3rem !important;
        padding: 0 !important;
        text-align: center;
        overflow: visible !important;
    }

    .row-action-icon {
        display: inline-flex;
        width: 1rem;
        justify-content: center;
    }

    /* Default <summary> styling adds a list-marker that conflicts with
     * the icon-only button look. */
    .datatable-row-actions-td :global(summary) {
        list-style: none;
    }
    .datatable-row-actions-td :global(summary::-webkit-details-marker) {
        display: none;
    }
</style>
