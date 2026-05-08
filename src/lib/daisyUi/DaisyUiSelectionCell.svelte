<script lang="ts">
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import { configContext, messageFormatterContext, selectionContext } from '$lib/util/context.js';
    import { resolveActionLabel } from '$lib/util/actionLabelUtil.js';

    interface Props {
        item: Record<string, unknown>;
    }

    let { item }: Props = $props();

    const selection = $derived(selectionContext.get().current);
    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);

    const id = $derived(item[config.dataUniquePropertyKey] as SelectionId);
    const checked = $derived(selection.has(id));
    const selectable = $derived(selection.isItemSelectable(item));
    const ariaLabel = $derived(resolveActionLabel(config, format, 'selectRow', 'Select row'));

    /** Stop the row's onclick (open modal / `onItemClick` / navigation) from
     * firing when the user toggles selection. The checkbox's own change
     * handler is the only side-effect that should run. */
    function onCellClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    function onChange(): void {
        if (!selectable) return;
        selection.toggle(id);
    }
</script>

<td class="datatable-selection-td" onclick={onCellClick}>
    <label class="flex h-full cursor-pointer items-center justify-center">
        <input
            type="checkbox"
            class="checkbox checkbox-sm"
            {checked}
            disabled={!selectable}
            onchange={onChange}
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
