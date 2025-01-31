import { QueryResult } from '$lib/dataSource/QueryResult.js';
import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import { AbstractDataSource } from './AbstractDataSource.svelte.js';

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
            .then((data) => (this.queryResult = QueryResult.buildSuccess(data)))
            .catch((error) => (this.queryResult = QueryResult.buildError(error)));
    }
}
