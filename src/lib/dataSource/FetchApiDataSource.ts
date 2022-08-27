import type { Writable } from 'svelte/store';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import type { IDataSource } from './IDataSource.js';
import type { QueryObserver } from './QueryObserver.js';

export class FetchApiDataSource implements IDataSource {
	constructor(private url: string) {}

	requestData(data: PaginatedListRequest): Promise<PaginatedListResponse> | Writable<QueryObserver> {
		return fetch(this.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then((data) => data.json());
	}
}
