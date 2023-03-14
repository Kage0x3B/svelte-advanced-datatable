import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
// @ts-ignore
import type { CreateQueryOptions, CreateQueryResult } from '@tanstack/svelte-query';
import { createQuery } from '@tanstack/svelte-query';
import type { Readable, Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { IDataSource } from '../IDataSource.js';
import type { QueryObserver } from '../QueryObserver.js';
import { buildLoadingQueryObserver } from '../QueryObserver.js';

export type DataTableUseQueryStoreResult<Data> = CreateQueryResult<PaginatedListResponse<Data>>;
export type DataTableUseQueryOptions<Data> = CreateQueryOptions<
	PaginatedListResponse<Data>,
	unknown,
	PaginatedListResponse<Data>,
	DataTableQueryKey<Data>
>;
export type DataTableQueryKey<Data> = [key: string, request: PaginatedListRequest<Data>];

/**
 * Uses the Svelte Query library to fetch your paginated table data.
 */
export class SvelteQueryDataSource<Data> implements IDataSource<Data> {
	private dataQuery: DataTableUseQueryStoreResult<Data> | undefined;
	private dataQueryUnsubscribe: (() => void) | undefined;
	private readonly dataObserver: Writable<QueryObserver<Data>>;
	private initialized = false;
	private queryKeyPrefix: string | undefined;
	private queryKey: unknown[] = [];
	private queryEnabled: boolean | undefined = undefined;

	/**
	 * Create a new data source to fetch your paginated table data from an api endpoint
	 * using Svelte Query in the background to manage requests, caching and more.
	 *
	 * @param apiFunction the api function which actually fetches your data, passed through to Svelte Query as the [query function](https://sveltequery.vercel.app/guides/query-functions).
	 * A query function can be literally any function that returns a promise. The promise that is returned should either resolve the data or throw an error.
	 * @param additionalQueryOptions additional options passed to Svelte Query
	 *
	 * @see {@link https://sveltequery.vercel.app/reference/useQuery}
	 */
	constructor(
		private apiFunction: ApiFunction<Data>,
		private additionalQueryOptions: DataTableUseQueryOptions<Data> = {
			keepPreviousData: true
		}
	) {
		this.dataObserver = writable(buildLoadingQueryObserver());

		if (typeof this.additionalQueryOptions.enabled !== 'undefined') {
			this.queryEnabled = !!this.additionalQueryOptions.enabled;
		}
	}

	public getQueryObserver(): Readable<QueryObserver<Data>> {
		return this.dataObserver;
	}

	public init(config: FullDataTableConfig<Data>): void {
		this.queryKeyPrefix = `dataTable-${config.type}`;

		this.initialized = true;
	}

	public requestData(data: PaginatedListRequest<Data>): void {
		if (!this.initialized) {
			throw new Error('Svelte-Query data source was not properly initialized before requesting data');
		}

		this.queryEnabled ??= true;

		this.queryKey = [this.queryKeyPrefix, this.normalizeRequestData(data)];
		this.updateQueryOptions({});
	}

	public setApiFunction(apiFunction: ApiFunction<Data>): void {
		this.apiFunction = apiFunction;

		this.updateQueryOptions({});
	}

	public setEnabled(enabled: boolean): void {
		this.queryEnabled = enabled;

		this.updateQueryOptions({});
	}

	public updateQueryOptions(
		queryOptions: Partial<Omit<DataTableUseQueryOptions<Data>, 'queryKey' | 'queryFn'>>
	): void {
		if (typeof queryOptions.enabled !== 'undefined') {
			this.queryEnabled = !!queryOptions.enabled;
		}

		this.additionalQueryOptions = {
			...this.additionalQueryOptions,
			...queryOptions
		};

		if (!this.initialized) {
			return;
		}

		if (this.dataQueryUnsubscribe) {
			this.dataQueryUnsubscribe();
		}

		this.dataQuery = createQuery({
			...this.additionalQueryOptions,
			queryKey: this.queryKey,
			queryFn: this.wrapApiFunction(),
			enabled: this.queryEnabled ?? false
		});

		this.dataQueryUnsubscribe = this.dataQuery.subscribe((value: QueryObserver<Data>) =>
			this.dataObserver.set(value)
		);
	}

	private wrapApiFunction(): (options: {
		queryKey: DataTableQueryKey<Data>;
	}) => Promise<PaginatedListResponse<Data>> {
		return ({ queryKey }) => {
			return this.apiFunction(queryKey[1]);
		};
	}

	private normalizeRequestData(data: PaginatedListRequest<Data>): PaginatedListRequest<Data> {
		return {
			start: data.start ?? 0,
			amount: data.amount ?? 10,
			orderBy:
				data.orderBy && data.orderBy.column
					? {
							order: data.orderBy.order ?? 'desc',
							column: data.orderBy.column
					  }
					: undefined,
			rawSearchQuery: data.rawSearchQuery ?? '',
			searchQuery: {
				searchText: data.searchQuery?.searchText ?? '',
				searchCategories: data.searchQuery?.searchCategories ?? [],
				searchFilters: data.searchQuery?.searchFilters ?? [],
				forceGlobalSearch: data.searchQuery?.forceGlobalSearch ?? false
			}
		};
	}
}
