import type { ParsedSearchQuery } from '$lib/searchParser/index.js';

/**
 * Request data which is sent by the dataTable when it is first loaded or the used changed the page, searched or sorted a column
 */
export interface PaginatedListRequest<Data> {
    start: number;
    amount: number;
    orderBy?: {
        column: keyof Data | string;
        order: 'asc' | 'desc';
    };
    /**
     * Secondary sort criteria applied as tiebreakers after `orderBy`.
     * Populated by Shift-clicking column headers in the UI. Backends that
     * don't understand multi-sort can ignore this — the primary `orderBy`
     * is still set.
     */
    additionalOrderBy?: Array<{
        column: keyof Data | string;
        order: 'asc' | 'desc';
    }>;
    rawSearchQuery?: string;
    searchQuery?: ParsedSearchQuery;
}
