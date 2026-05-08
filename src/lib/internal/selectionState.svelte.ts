import type { SelectionId } from '$lib/types/SelectionId.js';
import { SvelteSet } from 'svelte/reactivity';

export interface SelectionStateOptions<Data> {
    /** Initial selection — restored from a snapshot, the bindable prop, or both. */
    initial?: SelectionId[];
    /** Read the unique-property value from a row. Reactive via the underlying config. */
    getKey: (item: Data) => SelectionId;
    /**
     * Reactive accessor for the items currently visible on the active page.
     * Invoked from within `$derived` getters, so the closure must read reactive
     * state directly to surface updates.
     */
    getCurrentPageItems: () => readonly Data[];
    /**
     * Predicate gating individual rows from being toggled. Falls through to
     * `() => true` when the consumer hasn't supplied one. Reactive — the
     * implementation should read from the config inside the closure so a
     * runtime swap is picked up.
     */
    isRowSelectable?: (item: Data) => boolean;
}

/**
 * SvelteSet-backed selection store. Each row's id (read via `getKey`) is the
 * source of truth for "is this row selected" — selection therefore persists
 * across pagination, sort, and filter changes (only an explicit `clear()` or
 * deselect drops an id).
 *
 * The store is intentionally agnostic of where it lives: `DaisyUiDataTable`
 * instantiates it once, mirrors its `ids` getter into the bindable prop, and
 * pipes user actions back in via `toggle` / `toggleAllOnPage` / `clear`.
 */
export class SelectionState<Data = unknown> {
    private set: SvelteSet<SelectionId>;
    private opts: SelectionStateOptions<Data>;

    constructor(opts: SelectionStateOptions<Data>) {
        this.opts = opts;
        this.set = new SvelteSet<SelectionId>(opts.initial ?? []);
    }

    /** Reactive: whether `id` is currently selected. */
    has(id: SelectionId): boolean {
        return this.set.has(id);
    }

    /**
     * Whether the row may be toggled. Defaults to `true` when no predicate
     * was supplied. Used by the row checkbox + the page-wide select-all to
     * skip locked rows.
     */
    isItemSelectable(item: Data): boolean {
        return this.opts.isRowSelectable?.(item) ?? true;
    }

    /** Toggle membership for a single id. No-op for non-selectable rows when
     * called via the checkbox path, but raw `toggle` doesn't enforce the
     * predicate — the UI does. */
    toggle(id: SelectionId): void {
        if (this.set.has(id)) this.set.delete(id);
        else this.set.add(id);
    }

    select(id: SelectionId): void {
        this.set.add(id);
    }

    deselect(id: SelectionId): void {
        this.set.delete(id);
    }

    clear(): void {
        if (this.set.size > 0) this.set.clear();
    }

    /**
     * Tri-state header behaviour. Operates on the page's selectable subset:
     *
     * - all selectable items selected → deselect them all
     * - some / none selected → select all selectable items
     *
     * Off-page selections survive — only items currently on screen are
     * touched. Empty pages are a no-op.
     */
    toggleAllOnPage(): void {
        const selectable = this.opts.getCurrentPageItems().filter((item) => this.isItemSelectable(item));
        if (selectable.length === 0) return;
        const allSelected = selectable.every((item) => this.set.has(this.opts.getKey(item)));
        if (allSelected) {
            for (const item of selectable) this.set.delete(this.opts.getKey(item));
        } else {
            for (const item of selectable) this.set.add(this.opts.getKey(item));
        }
    }

    /** Selected ids. Reactive — `Array.from` over a SvelteSet tracks reads. */
    get ids(): SelectionId[] {
        return Array.from(this.set);
    }

    /** Selected count. Reactive. */
    get count(): number {
        return this.set.size;
    }

    /**
     * Tri-state header checkbox state derived from the *current page* only.
     * Off-page selections don't influence the header — that would otherwise
     * lock it into "indeterminate" forever once the user paginates away from
     * a partial page.
     */
    get pageSelectionState(): 'none' | 'some' | 'all' {
        const selectable = this.opts.getCurrentPageItems().filter((item) => this.isItemSelectable(item));
        if (selectable.length === 0) return 'none';
        let selected = 0;
        for (const item of selectable) {
            if (this.set.has(this.opts.getKey(item))) selected++;
        }
        if (selected === 0) return 'none';
        if (selected === selectable.length) return 'all';
        return 'some';
    }

    /**
     * Replace the selection with the given ids. Used to sync from the
     * bindable `selectedIds` prop and from snapshot restore. A diffing
     * implementation avoids unnecessary `add` calls for ids already present
     * (which would otherwise re-fire reactive subscribers).
     */
    replaceAll(ids: Iterable<SelectionId>): void {
        const next = new Set(ids);
        if (next.size === this.set.size) {
            let identical = true;
            for (const id of next) {
                if (!this.set.has(id)) {
                    identical = false;
                    break;
                }
            }
            if (identical) return;
        }
        this.set.clear();
        for (const id of next) this.set.add(id);
    }
}
