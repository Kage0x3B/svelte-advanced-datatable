import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import type { IDataSource } from './IDataSource.js';

/**
 * Uses the {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API} to request the data from an api endpoint via HTTP POST requests
 */
export class FetchApiDataSource implements IDataSource {
	/**
	 * Create a new data source to fetch your paginated table data from an api endpoint.
	 *
	 * The endpoint will receive HTTP POST requests with a json body consisting of an {@link PaginatedListRequest}.
	 * Your server has to answer with a {@link PaginatedListResponse} json body.
	 * @param url a url to your api endpoint, for example `/api/users/list`
	 */
	constructor(private url: string) {}

	requestData(data: PaginatedListRequest): Promise<PaginatedListResponse> {
		return fetch(this.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then((data) => data.json());
	}
}
