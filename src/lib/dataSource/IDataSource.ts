import type { Readable } from 'svelte/store';
import type { FullDataTableConfig } from '../types/DataTableConfig.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { QueryObserver } from './QueryObserver.js';

export interface IDataSource<Data> {
	init?(config: FullDataTableConfig<Data>): void;

	/**
	 * Called to retrieve the initial datatable entries and everytime the request changes, for example when
	 * the user loads the next page, sorts the entries or searches for something
	 * @param data the request data to be passed through to the server
	 */
	requestData(data: PaginatedListRequest<Data>): void;

	getQueryObserver(): Readable<QueryObserver<Data>>;

	/**
	 * Called by the datatable svelte component when it is mounted
	 */
	onMount?(): void;

	/**
	 * Hooks into SvelteKits {@link https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate afterNavigate hook}
	 */
	afterNavigate?(): void;
}
