import type { QueryKey, UseQueryOptions } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import type { UseQueryStoreResult } from '@sveltestack/svelte-query/dist/types.js';
import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { ApiFunction } from '../types/ApiFunction.js';
import type { DataRecord } from '../types/DataRecord.js';
import type { FullDataTableConfig } from '../types/DataTableConfig.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';
import type { IDataSource } from './IDataSource.js';
import type { QueryObserver } from './QueryObserver.js';

export type DataTableUseQueryStoreResult<T extends DataRecord> = UseQueryStoreResult<
	PaginatedListResponse<T>,
	unknown,
	PaginatedListResponse<T>,
	DataTableQueryKey<T>
>;
export type DataTableUseQueryOptions<T extends DataRecord> = UseQueryOptions<
	PaginatedListResponse<T>,
	unknown,
	PaginatedListResponse<T>,
	DataTableQueryKey<T>
>;
export type DataTableQueryKey<T extends DataRecord> = [key: string, request: PaginatedListRequest<T>];

/**
 * Uses the Svelte Query library to fetch your paginated table data.
 */
export class SvelteQueryDataSource<T extends DataRecord = DataRecord> implements IDataSource<T> {
	private readonly dataQuery: DataTableUseQueryStoreResult<T>;
	private readonly dataObserver: Readable<QueryObserver<T>>;
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
	constructor(private apiFunction: ApiFunction<T>, private additionalQueryOptions: DataTableUseQueryOptions<T> = {}) {
		this.dataQuery = this.useNoopQuery();
		this.dataObserver = derived(this.dataQuery, ($dataQuery) => $dataQuery as QueryObserver<T>);
	}

	public getQueryObserver(): Readable<QueryObserver> {
		return this.dataObserver;
	}

	public init(config: FullDataTableConfig<T>): void {
		this.queryKey = `dataTable-${config.type}`;
	}

	public requestData(data: PaginatedListRequest): void {
		if (typeof this.queryKey === 'undefined') {
			throw new Error('Svelte-Query data source was not properly initialized before requesting data');
		}

		this.dataQuery.setOptions([this.queryKey, data], this.wrapApiFunction(), {
			enabled: true,
			keepPreviousData: true,
			...this.additionalQueryOptions
		});
	}

	public setApiFunction(apiFunction: ApiFunction<T>): void {
		this.apiFunction = apiFunction;
	}

	public setEnabled(enabled: boolean): void {
		this.dataQuery.setEnabled(enabled);
	}

	public updateQueryOptions(queryOptions: Partial<DataTableUseQueryOptions<T>>): void {
		this.additionalQueryOptions = {
			...this.additionalQueryOptions,
			...queryOptions
		};

		this.dataQuery.updateOptions(
			this.additionalQueryOptions as unknown as UseQueryOptions<
				PaginatedListResponse<T>,
				unknown,
				PaginatedListResponse<T>
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

	private wrapApiFunction(): (options: { queryKey: DataTableQueryKey<T> }) => Promise<PaginatedListResponse<T>> {
		return ({ queryKey }) => {
			return this.apiFunction(queryKey[1]);
		};
	}
}
