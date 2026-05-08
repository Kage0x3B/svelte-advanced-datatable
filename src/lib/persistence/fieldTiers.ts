import type { DataTableState } from '$lib/types/DataTableState.js';

/**
 * Persistence tier each known state field belongs to.
 *
 * - `transient` — short-lived per-view state (search, page, sort, modal-open).
 *   Backed by URL params or the SvelteKit Snapshot API.
 * - `persistent` — longer-lived UI prefs (column widths/visibility/order/density).
 *   Backed by `localStorage` / `sessionStorage`.
 * - `none` — never persisted.
 *
 * Future feature PRs add their entry here when the field becomes user-editable.
 */
export type FieldTier = 'transient' | 'persistent' | 'none';

export const FIELD_TIER: Record<keyof DataTableState, FieldTier> = {
    currentPage: 'transient',
    searchInput: 'transient',
    sortColumnKey: 'transient',
    sortDirection: 'transient',
    currentOpenIndex: 'transient',
    columnVisibility: 'persistent',
    columnWidths: 'persistent',
    columnOrder: 'persistent',
    density: 'persistent'
} as const;

/**
 * Short, stable backend keys for each field. URL params and storage keys are
 * derived as `${prefix}-${FIELD_KEY[field]}`.
 *
 * These are part of the persistence wire format — changing them is a breaking
 * change for any user already on the URL or storage backends.
 */
export const FIELD_KEY: Record<keyof DataTableState, string> = {
    currentPage: 'page',
    searchInput: 'q',
    sortColumnKey: 'sortCol',
    sortDirection: 'sortDir',
    currentOpenIndex: 'open',
    columnVisibility: 'cols',
    columnWidths: 'colWidths',
    columnOrder: 'colOrder',
    density: 'density'
} as const;
