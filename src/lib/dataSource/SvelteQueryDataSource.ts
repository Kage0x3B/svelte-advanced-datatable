import type { QueryKey, UseQueryOptions } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import type { UseQueryStoreResult } from '@sveltestack/svelte-query/dist/types.js';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import type { IDataSource } from './IDataSource.js';
import type { QueryObserver } from './QueryObserver.js';

export type DataTableUseQueryStoreResult<Data> = UseQueryStoreResult<
	PaginatedListResponse<Data>,
	unknown,
	PaginatedListResponse<Data>,
	DataTableQueryKey<Data>
>;
export type DataTableUseQueryOptions<Data> = UseQueryOptions<
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
	private readonly dataQuery: DataTableUseQueryStoreResult<Data>;
	private readonly dataObserver: Readable<QueryObserver<Data>>;
	private queryKey: string | undefined;

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
	constructor(private apiFunction: ApiFunction<Data>, private additionalQueryOptions: DataTableUseQueryOptions<Data> = {}) {
		this.dataQuery = this.useNoopQuery();
		this.dataObserver = derived(this.dataQuery, ($dataQuery) => $dataQuery as QueryObserver<Data>);
	}

	public getQueryObserver(): Readable<QueryObserver<Data>> {
		return this.dataObserver;
	}

	public init(config: FullDataTableConfig<Data>): void {
		this.queryKey = `dataTable-${config.type}`;
	}

	public requestData(data: PaginatedListRequest<Data>): void {
		if (typeof this.queryKey === 'undefined') {
			throw new Error('Svelte-Query data source was not properly initialized before requesting data');
		}

		this.dataQuery.setOptions([this.queryKey, data], this.wrapApiFunction(), {
			enabled: true,
			keepPreviousData: true,
			...this.additionalQueryOptions
		});
	}

	public setApiFunction(apiFunction: ApiFunction<Data>): void {
		this.apiFunction = apiFunction;
	}

	public setEnabled(enabled: boolean): void {
		this.dataQuery.setEnabled(enabled);
	}

	public updateQueryOptions(queryOptions: Partial<DataTableUseQueryOptions<Data>>): void {
		this.additionalQueryOptions = {
			...this.additionalQueryOptions,
			...queryOptions
		};

		this.dataQuery.updateOptions(
			this.additionalQueryOptions as unknown as UseQueryOptions<
				PaginatedListResponse<Data>,
				unknown,
				PaginatedListResponse<Data>
			>
		);
	}

	private useNoopQuery<
		TQueryFnData,
		TError = unknown,
		TData = TQueryFnData,
		TQueryKey extends QueryKey = QueryKey
	>(): UseQueryStoreResult<TQueryFnData, TError, TData, TQueryKey> {
		return useQuery<TQueryFnData, TError, TData, TQueryKey>(
			[] as unknown as TQueryKey,
			() => undefined as unknown as TQueryFnData,
			{
				enabled: false
			}
		);
	}

	private wrapApiFunction(): (options: { queryKey: DataTableQueryKey<Data> }) => Promise<PaginatedListResponse<Data>> {
		return ({ queryKey }) => {
			return this.apiFunction(queryKey[1]);
		};
	}
}
