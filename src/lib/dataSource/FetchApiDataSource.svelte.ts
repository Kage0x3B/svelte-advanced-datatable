import { QueryResult } from '$lib/dataSource/QueryResult.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import { hasOwnProperty } from '$lib/util/generalUtil.js';
import { AbstractDataSource } from './AbstractDataSource.svelte.js';

/**
 * Uses the {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API} to request the data from an api endpoint via HTTP POST requests
 */
export class FetchApiDataSource<Data> extends AbstractDataSource<Data> {
    private abortController: AbortController | undefined;

    /**
     * Create a new data source to fetch your paginated table data from an api endpoint.
     *
     * The endpoint will receive HTTP POST requests with a json body consisting of an {@link PaginatedListRequest}.
     * Your server has to answer with a {@link PaginatedListResponse} json body.
     * @param url a url to your api endpoint, for example `/api/users/list`
     * @param options an object with [request init options](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) which get passed directly to fetch
     */
    constructor(
        private url: string,
        private options: RequestInit = {}
    ) {
        super();
    }

    requestData(data: PaginatedListRequest<Data>): void {
        this.abortController?.abort();
        const controller = new AbortController();
        this.abortController = controller;

        fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            ...this.options,
            signal: controller.signal
        })
            .then(async (response) => {
                let resData: Data | undefined = undefined;

                try {
                    resData = await response.json();
                } catch (error) {
                    if (controller.signal.aborted) return;
                    this.queryResult = QueryResult.buildError(error as Error);

                    return;
                }

                if (controller.signal.aborted) return;

                if (response.ok && typeof resData !== 'undefined') {
                    this.queryResult = QueryResult.buildSuccess(resData as unknown as PaginatedListResponse<Data>);
                } else {
                    const errorMessage = hasOwnProperty(resData, 'message')
                        ? String(resData!.message)
                        : 'Unknown network error';
                    const error = new Error(errorMessage);

                    if (resData) {
                        Object.assign(error, resData);
                    }

                    this.queryResult = QueryResult.buildError(error);
                }
            })
            .catch((error) => {
                if (controller.signal.aborted) return;
                this.queryResult = QueryResult.buildError(error as Error);
            });
    }
}
