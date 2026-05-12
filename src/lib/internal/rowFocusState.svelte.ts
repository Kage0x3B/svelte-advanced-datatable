/**
 * Tracks the keyboard-focused row index for the table's roving-tabindex
 * pattern. Exactly one row at a time exposes `tabindex=0`; arrow keys move
 * the focus by reassigning that index. Decoupled from `SelectionState` so
 * focus can move without touching selection.
 *
 * `anchor` is the row that anchors a Shift+Space range selection — set on
 * plain Space / plain click, consumed by Shift+Space. Lives here rather
 * than on `SelectionState` so the selection store stays purely set-like.
 */
export class RowFocusState {
    focusedIndex = $state(0);
    anchor = $state<number | null>(null);

    /** Set the focused index, clamped into `[0, total - 1]`. No-op when
     * `total === 0`. Reads `total` instead of holding a reference so
     * page-size and pagination shifts don't strand the focus past the end. */
    setIndex(i: number, total: number): void {
        if (total <= 0) return;
        const clamped = Math.max(0, Math.min(total - 1, i));
        this.focusedIndex = clamped;
    }

    /** Move focus by `delta` rows. Equivalent to `setIndex(current + delta, total)`. */
    move(delta: number, total: number): void {
        this.setIndex(this.focusedIndex + delta, total);
    }

    /** Reset focus + anchor when the visible page changes. Called by the
     * table when `currentPage` or the active items array changes. */
    reset(): void {
        this.focusedIndex = 0;
        this.anchor = null;
    }
}
