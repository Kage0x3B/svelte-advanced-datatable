import type { DataRecord } from './DataRecord.js';
import type { ParsedSearchQuery } from './ParsedSearchQuery.js';

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
