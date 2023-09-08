import type { ParsedSearchQuery } from '$lib/searchParser/index.js';

/**
 * Request data which is sent by the datatable when it is first loaded or the used changed the page, searched or sorted a column
 */
export interface PaginatedListRequest<Data> {
    start: number;
    amount: number;
    orderBy?: {
        column: keyof Data & string;
        order: 'asc' | 'desc';
    };
    rawSearchQuery: string;
    searchQuery: ParsedSearchQuery;
}
