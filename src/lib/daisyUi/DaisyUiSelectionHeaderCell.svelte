<script lang="ts">
    import { configContext, messageFormatterContext, selectionContext } from '$lib/util/context.js';
    import { resolveActionLabel } from '$lib/util/actionLabelUtil.js';

    const selection = $derived(selectionContext.get().current);
    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);

    const pageState = $derived(selection.pageSelectionState);
    const ariaLabel = $derived(
        resolveActionLabel(config, format, 'selectAllOnPage', 'Select all on page')
    );

    let inputEl: HTMLInputElement | undefined = $state();

    $effect(() => {
        if (inputEl) {
            inputEl.indeterminate = pageState === 'some';
        }
    });

    function onChange(): void {
        selection.toggleAllOnPage();
    }

    /** Stop the click on the cell from bubbling to the surrounding `<tr>` /
     * sort handlers — the checkbox is the only interactive surface here. */
    function onCellClick(event: MouseEvent): void {
        event.stopPropagation();
    }
</script>

<th
    class="datatable-selection-th"
    data-column-key="__selection"
    onclick={onCellClick}
>
    <label class="flex h-full cursor-pointer items-center justify-center">
        <input
            bind:this={inputEl}
            type="checkbox"
            class="checkbox checkbox-sm"
            checked={pageState === 'all'}
            onchange={onChange}
            aria-label={ariaLabel}
        />
    </label>
</th>

<style>
    .datatable-selection-th {
        width: 3rem;
        padding-inline: 0.5rem;
        text-align: center;
    }
</style>
