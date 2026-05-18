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

    let inputEl: HTMLInputElement | null = $state(null);

    /** Force the DOM `checked` property to match `checked` *after* the
     * current task flushes. A Shift+click extends the range and calls
     * `preventDefault()`, but the browser still applies its native
     * pre-toggle synchronously and only reverts it once the click event
     * finishes. If we wrote the property inside the microtask Svelte
     * schedules for this effect, the value we set would be overwritten by
     * the browser's post-handler revert — so we defer to a `requestAnimationFrame`,
     * by which point the revert has already happened. */
    $effect(() => {
        const target = inputEl;
        const next = checked;
        if (!target) return;
        if (target.checked !== next) target.checked = next;
        const raf = requestAnimationFrame(() => {
            if (target.checked !== next) target.checked = next;
        });
        return () => cancelAnimationFrame(raf);
    });

    /** Stop the row's onclick (open modal / `onItemClick` / navigation) from
     * firing when the user toggles selection. */
    function onCellClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    /** Own the toggle decision so Shift+click can extend from the anchor
     * instead of toggling. For a normal click we let the browser's native
     * checked-toggle run and mirror state from it — preventing the default
     * here would leave the property "dirty" and out of sync with the
     * `$effect` reconciler below, which only re-applies on derived changes.
     * For Shift+click we always preventDefault and reach for the range. */
    function onCheckboxClick(event: MouseEvent): void {
        if (!selectable) return;
        if (event.shiftKey && rowFocus.anchor !== null && rowFocus.anchor !== index) {
            event.preventDefault();
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
            bind:this={inputEl}
            type="checkbox"
            class="checkbox checkbox-sm"
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
