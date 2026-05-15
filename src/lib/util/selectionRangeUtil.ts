import type { SelectionState } from '$lib/internal/selectionState.svelte.js';
import type { SelectionId } from '$lib/types/SelectionId.js';

/**
 * Additively select every selectable item between two indices into the
 * current page's items array. Used by both Shift+Space (keyboard) and
 * Shift+click (checkbox) — the only piece they have in common, kept here
 * so SelectionState stays items-agnostic.
 *
 * Off-page selections are preserved; non-selectable rows are skipped.
 */
export function extendSelectionRange(
    selection: SelectionState<unknown>,
    items: readonly Record<string, unknown>[],
    anchorIndex: number,
    targetIndex: number,
    keyName: string
): void {
    const lo = Math.min(anchorIndex, targetIndex);
    const hi = Math.max(anchorIndex, targetIndex);
    for (let i = lo; i <= hi; i++) {
        const item = items[i];
        if (!item) continue;
        if (!selection.isItemSelectable(item)) continue;
        const id = item[keyName] as SelectionId | undefined;
        if (id === undefined) continue;
        selection.select(id);
    }
}
