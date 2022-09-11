import type { ApiFunction } from '../types/ApiFunction.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import { AbstractDataSource } from './AbstractDataSource.js';

/**
 * Uses your custom api function to request data
 */
export class ApiFunctionDataSource<Data> extends AbstractDataSource<Data> {
	/**
	 * Create a new data source to fetch the paginated table data using your custom api function.
	 *
	 * @param apiFunction the api function which requests data by sending the {@link PaginatedListRequest} and returning a {@link PaginatedListResponse}
	 */
	constructor(private apiFunction: ApiFunction<Data>) {
		super();
	}

	requestData(data: PaginatedListRequest<Data>): void {
		this.apiFunction(data)
			.then((data) => this.updateStatus({ data }))
			.catch((err) => this.updateStatus({ error: err as Error }));
	}
}
