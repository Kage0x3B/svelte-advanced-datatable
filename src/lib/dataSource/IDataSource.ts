import type { Writable } from 'svelte/store';
import type { DataRecord } from '../types/DataRecord.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import type { QueryObserver } from './QueryObserver.js';

export interface IDataSource<T extends DataRecord = DataRecord> {
	/**
	 * Called to retrieve the initial datatable entries and everytime the request changes, for example when
	 * the user loads the next page, sorts the entries or searches for something
	 * @param data the request data to be passed through to the server
	 */
	requestData(data: PaginatedListRequest<T>): Promise<PaginatedListResponse<T>> | Writable<QueryObserver>;

	onMount?(): void;

	afterNavigate?(): void;
}
