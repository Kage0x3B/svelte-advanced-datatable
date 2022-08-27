import type { DataRecord } from '../types/DataRecord.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';

export type ForcedSearchQuery<T extends DataRecord = DataRecord> = Partial<
	Pick<PaginatedListRequest<T>, 'searchQuery' | 'orderBy'>
>;
