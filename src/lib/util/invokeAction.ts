import type { SelectionState } from '$lib/internal/selectionState.svelte.js';
import type { DataTableAction } from '$lib/types/DataTableAction.js';
import type { SelectionId } from '$lib/types/SelectionId.js';

/**
 * Resolved arguments for one action invocation.
 *
 * - `kind: 'row'` represents a single-row trigger (the row's three-dot
 *   menu). The runtime prefers `onSingle` and falls through to `onMulti`
 *   with `[id]` when the action only registered the bulk form.
 * - `kind: 'bulk'` represents the selection toolbar; only `onMulti` is
 *   considered.
 */
export type ActionInvocation<Data> =
    | { kind: 'row'; item: Data; id: SelectionId }
    | { kind: 'bulk'; ids: SelectionId[] };

export interface InvokeActionOptions<Data> {
    action: DataTableAction<Data>;
    invocation: ActionInvocation<Data>;
    selection: SelectionState<Data>;
    /**
     * Triggers a re-fetch of the visible page. Called after the handler
     * resolves when `action.refreshAfter !== false`. Provided by the table
     * component since the canonical refresh path runs through the same
     * effect that drives initial loads.
     */
    refresh: () => void | Promise<void>;
}

/**
 * Centralised action runner. Calls the appropriate handler, optionally
 * refreshes the data source, and optionally clears selection. Errors are
 * logged but never re-thrown — surfacing a user-visible error toast is the
 * consumer's responsibility (it has the application's i18n + toast wiring,
 * not the table).
 */
export async function invokeAction<Data>({
    action,
    invocation,
    selection,
    refresh
}: InvokeActionOptions<Data>): Promise<void> {
    try {
        if (invocation.kind === 'row') {
            if (action.onSingle) {
                await action.onSingle(invocation.item);
            } else if (action.onMulti) {
                await action.onMulti([invocation.id]);
            } else {
                console.warn(
                    `DataTable action "${action.key}" has no onSingle or onMulti handler — invocation skipped.`
                );
                return;
            }
        } else {
            if (!action.onMulti) {
                console.warn(
                    `DataTable action "${action.key}" cannot be invoked in bulk context (no onMulti handler).`
                );
                return;
            }
            await action.onMulti(invocation.ids);
        }
    } catch (err) {
        console.error(`DataTable action "${action.key}" handler threw:`, err);
        return;
    }

    if (action.refreshAfter ?? true) {
        try {
            await refresh();
        } catch (err) {
            console.error(`DataTable action "${action.key}" failed to refresh data source:`, err);
        }
    }

    const clearDefault = invocation.kind === 'bulk';
    if (action.clearSelectionAfter ?? clearDefault) {
        selection.clear();
    }
}
