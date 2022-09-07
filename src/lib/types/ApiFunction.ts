import type { DataRecord } from './DataRecord.js';
import type { PaginatedListRequest } from './PaginatedListRequest.js';
import type { PaginatedListResponse } from './PaginatedListResponse.js';

export type ApiFunction<T extends DataRecord = DataRecord> = (
	request: PaginatedListRequest<T>
) => Promise<PaginatedListResponse<T>>;
