import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import { hasOwnProperty } from '../util/generalUtil.js';
import { AbstractDataSource } from './AbstractDataSource.js';

/**
 * Uses the {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API} to request the data from an api endpoint via HTTP POST requests
 */
export class FetchApiDataSource<Data> extends AbstractDataSource<Data> {
	/**
	 * Create a new data source to fetch your paginated table data from an api endpoint.
	 *
	 * The endpoint will receive HTTP POST requests with a json body consisting of an {@link PaginatedListRequest}.
	 * Your server has to answer with a {@link PaginatedListResponse} json body.
	 * @param url a url to your api endpoint, for example `/api/users/list`
	 * @param options [request init options](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) which get passed directly to fetch
	 */
	constructor(private url: string, private options: RequestInit = {}) {
		super();
	}

	requestData(data: PaginatedListRequest<Data>): void {
		fetch(this.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data),
			...this.options
		}).then(async (response) => {
			let resData: Data | undefined = undefined;

			try {
				resData = await response.json();
				// eslint-disable-next-line no-empty
			} catch (ignored) {}

			if (response.ok && typeof resData !== 'undefined') {
				this.updateStatus({
					data: resData as unknown as PaginatedListResponse<Data>
				});
			} else {
				const errorMessage = hasOwnProperty(resData, 'message')
					? String(resData!.message)
					: 'Unknown network error';
				const error = new Error(errorMessage);

				if (resData) {
					Object.assign(error, resData);
				}

				this.updateStatus({
					error: error
				});
			}
		});
	}
}
