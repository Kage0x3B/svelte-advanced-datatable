<script lang="ts">
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import {
        configContext,
        dataSourceContext,
        messageFormatterContext,
        rowFocusContext,
        selectionContext
    } from '$lib/util/context.js';
    import { resolveActionLabel } from '$lib/util/actionLabelUtil.js';
    import { extendSelectionRange } from '$lib/util/selectionRangeUtil.js';

    interface Props {
        item: Record<string, unknown>;
        index: number;
    }

    let { item, index }: Props = $props();

    const selection = $derived(selectionContext.get().current);
    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const rowFocus = $derived(rowFocusContext.get().current);
    const dataSource = $derived(dataSourceContext.get().current);

    const id = $derived(item[config.dataUniquePropertyKey] as SelectionId);
    const checked = $derived(selection.has(id));
    const selectable = $derived(selection.isItemSelectable(item));
    const ariaLabel = $derived(resolveActionLabel(config, format, 'selectRow', 'Select row'));

    /** Stop the row's onclick (open modal / `onItemClick` / navigation) from
     * firing when the user toggles selection. */
    function onCellClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    /** Own the toggle decision so Shift+click can extend from the anchor
     * instead of toggling. Native click→change is suppressed via
     * preventDefault and the visible checked state stays in sync via the
     * bound `checked` prop above (it reads `selection.has(id)`). */
    function onCheckboxClick(event: MouseEvent): void {
        if (!selectable) return;
        event.preventDefault();
        if (event.shiftKey && rowFocus.anchor !== null && rowFocus.anchor !== index) {
            const items = (dataSource.queryResult.data?.items ?? []) as Record<string, unknown>[];
            extendSelectionRange(
                selection,
                items,
                rowFocus.anchor,
                index,
                config.dataUniquePropertyKey
            );
            return;
        }
        selection.toggle(id);
        rowFocus.anchor = index;
    }
</script>

<td class="datatable-selection-td" onclick={onCellClick}>
    <label class="flex h-full cursor-pointer items-center justify-center">
        <input
            type="checkbox"
            class="checkbox checkbox-sm"
            {checked}
            disabled={!selectable}
            onclick={onCheckboxClick}
            aria-label={ariaLabel}
        />
    </label>
</td>

<style>
    .datatable-selection-td {
        width: 3rem !important;
        padding: 0 !important;
        text-align: center;
    }
</style>
