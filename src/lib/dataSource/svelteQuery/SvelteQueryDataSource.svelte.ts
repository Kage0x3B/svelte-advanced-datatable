import type { IDataSource } from '$lib/dataSource/IDataSource.js';
import { QueryResult } from '$lib/dataSource/QueryResult.js';
import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import type { CreateQueryOptions, CreateQueryResult } from '@tanstack/svelte-query';
import { createQuery } from '@tanstack/svelte-query';

export type DataTableUseQueryStoreResult<Data> = CreateQueryResult<PaginatedListResponse<Data>, Error>;
export type DataTableUseQueryOptions<Data> = CreateQueryOptions<
    PaginatedListResponse<Data>,
    Error,
    PaginatedListResponse<Data>,
    DataTableQueryKey<Data>
>;
type AdditionalUseQueryOptions<Data> = Partial<Omit<DataTableUseQueryOptions<Data>, 'queryKey' | 'queryFn'>>;
export type DataTableQueryKey<Data> = [key: string, request: PaginatedListRequest<Data>];

/**
 * Uses the Svelte Query library to fetch your paginated table data.
 */
export class SvelteQueryDataSource<Data> implements IDataSource<Data> {
    public apiFunction: ApiFunction<Data> | undefined = $state();
    public additionalQueryOptions: AdditionalUseQueryOptions<Data> = $state({});
    protected dataTableConfig: FullDataTableConfig<Data> | undefined = $state();
    private queryKey: DataTableQueryKey<Data> | undefined = $state(undefined);

    private queryOptions: DataTableUseQueryOptions<Data> = $derived(this.createQueryOptions());
    private dataQuery: DataTableUseQueryStoreResult<Data> = createQuery(() => this.queryOptions);
    private initialized = false;
    private queryKeyPrefix: string | undefined = $state();
    private queryEnabled: boolean = $state(true);

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
    constructor(apiFunction: ApiFunction<Data>, additionalQueryOptions: AdditionalUseQueryOptions<Data> = {}) {
        this.apiFunction = apiFunction;
        this.additionalQueryOptions = additionalQueryOptions;
    }

    private _queryResult: QueryResult<Data> = $derived(this.deriveQueryResult());

    public get queryResult(): QueryResult<Data> {
        return this._queryResult;
    }

    setConfig(config: FullDataTableConfig<Data>) {
        this.dataTableConfig = config;

        this.queryKeyPrefix = `dataTable-${config.type}`;

        this.initialized = true;
    }

    public requestData(data: PaginatedListRequest<Data>): void {
        if (!this.initialized || !this.queryKeyPrefix) {
            throw new Error('Svelte-Query data source was not properly initialized before requesting data');
        }

        this.queryEnabled ??= true;

        this.queryKey = [this.queryKeyPrefix, this.normalizeRequestData(data)];
    }

    private createQueryOptions(): DataTableUseQueryOptions<Data> {
        if (!this.queryKey || !this.apiFunction) {
            return {
                queryKey: [] as unknown as DataTableQueryKey<Data>,
                enabled: false
            };
        }

        return {
            staleTime: 30 * 1000,
            gcTime: 60 * 1000,
            ...this.additionalQueryOptions,
            queryKey: this.queryKey,
            queryFn: this.wrapApiFunction()
        };
    }

    private deriveQueryResult(): QueryResult<Data> {
        if (this.dataQuery.isSuccess) {
            return QueryResult.buildSuccess(this.dataQuery.data);
        } else if (this.dataQuery.isError) {
            return QueryResult.buildError(this.dataQuery.error);
        } else {
            return QueryResult.buildLoading();
        }
    }

    private wrapApiFunction(): (options: {
        queryKey: DataTableQueryKey<Data>;
    }) => Promise<PaginatedListResponse<Data>> {
        return ({ queryKey }) => {
            console.log('calling api with', $state.snapshot(queryKey[1]));
            return this.apiFunction!(queryKey[1]);
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
