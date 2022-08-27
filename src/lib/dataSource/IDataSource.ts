import type { Writable } from 'svelte/store';
import type { DataRecord } from '../types/DataRecord.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import type { QueryObserver } from './QueryObserver.js';

export interface IDataSource<T extends DataRecord = DataRecord> {
	requestData(data: PaginatedListRequest<T>): Promise<PaginatedListResponse<T>> | Writable<QueryObserver>;

	onMount?(): void;

	afterNavigate?(): void;
}
