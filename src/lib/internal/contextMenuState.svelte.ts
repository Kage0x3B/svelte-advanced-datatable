import type { SelectionId } from '$lib/types/SelectionId.js';

/**
 * Discriminated union describing what the context menu was opened for.
 * Mirrors the shape consumed by `invokeAction` so the menu can hand the
 * invocation straight through to the existing `actionRunnerContext`.
 *
 * `loadedItems` (bulk variant) carries only the selected rows that are
 * currently loaded into the active page. Cross-page selections may include
 * extra `ids` for rows the consumer hasn't fetched yet — same convention
 * as `onSelectionChange.loadedItems` and `ActionDisabledContext`.
 */
export type ContextMenuInvocation<Data = unknown> =
    | { kind: 'row'; item: Data; id: SelectionId }
    | { kind: 'bulk'; ids: SelectionId[]; loadedItems: Data[] };

/**
 * Reactive store backing the per-table right-click / long-press context
 * menu. One instance per table, opened by `DaisyUiDataRow` and rendered by
 * a single `DaisyUiContextMenu` mounted at the table root.
 */
export class ContextMenuState<Data = unknown> {
    open = $state(false);
    x = $state(0);
    y = $state(0);
    invocation = $state<ContextMenuInvocation<Data> | null>(null);

    /** Open the menu at the supplied viewport coordinates. The component
     * clamps into the visible viewport at render time, so callers can pass
     * raw `event.clientX/Y` without trimming. */
    show(x: number, y: number, invocation: ContextMenuInvocation<Data>): void {
        this.x = x;
        this.y = y;
        this.invocation = invocation;
        this.open = true;
    }

    close(): void {
        if (this.open) {
            this.open = false;
            this.invocation = null;
        }
    }
}
