import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { QueryResult } from './QueryResult.js';

export interface IDataSource<Data> {
    readonly queryResult: QueryResult<Data>;

    setConfig?(config: FullDataTableConfig<Data>): void;

    /**
     * Called to retrieve the initial dataTable entries and everytime the request changes, for example when
     * the user loads the next page, sorts the entries or searches for something
     * @param data the request data to be passed through to the server
     */
    requestData(data: PaginatedListRequest<Data>): void;

    /**
     * Called by the dataTable svelte component when it is mounted
     */
    onMount?(): void;

    /**
     * Hooks into SvelteKits {@link https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate afterNavigate hook}
     */
    afterNavigate?(): void;
}
