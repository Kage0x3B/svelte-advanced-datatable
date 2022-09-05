import type { ParsedSearchQuery } from '../searchParser/index.js';
import type { DataRecord } from './DataRecord.js';

/**
 * Request data which is sent by the datatable when it is first loaded or the used changed the page, searched or sorted a column
 */
export interface PaginatedListRequest<T extends DataRecord = DataRecord> {
	start: number;
	amount: number;
	orderBy?: {
		column: keyof T & string;
		order: 'asc' | 'desc';
	};
	rawSearchQuery?: string;
	searchQuery?: ParsedSearchQuery;
}
