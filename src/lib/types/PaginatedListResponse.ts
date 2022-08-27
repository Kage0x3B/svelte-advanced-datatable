import type { DataRecord } from './DataRecord.js';

export interface PaginatedListResponse<T extends DataRecord = DataRecord> {
	totalCount: number;

	items: T[];
}
