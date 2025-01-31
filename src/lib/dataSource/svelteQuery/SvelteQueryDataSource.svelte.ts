import { AbstractDataSource } from '$lib/dataSource/index.js';
import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import { ap } from '@faker-js/faker/dist/airline-D6ksJFwG.js';
import type { CreateQueryOptions, CreateQueryResult } from '@tanstack/svelte-query';
import { createQuery } from '@tanstack/svelte-query';

export type DataTableUseQueryStoreResult<Data> = CreateQueryResult<PaginatedListResponse<Data>>;
export type DataTableUseQueryOptions<Data> = Partial<
    CreateQueryOptions<PaginatedListResponse<Data>, unknown, PaginatedListResponse<Data>, DataTableQueryKey<Data>>
>;
export type DataTableQueryKey<Data> = [key: string, request: PaginatedListRequest<Data>];

/**
 * Uses the Svelte Query library to fetch your paginated table data.
 */
export class SvelteQueryDataSource<Data> extends AbstractDataSource<Data> {
    public apiFunction: ApiFunction<Data> | undefined = $state();
    public additionalQueryOptions: DataTableUseQueryOptions<Data> = $state({});
    private queryKey: DataTableQueryKey<unknown> | undefined = $state(undefined);

    private queryOptions: CreateQueryOptions<
        PaginatedListResponse<Data>,
        unknown,
        PaginatedListResponse<Data>,
        DataTableQueryKey<Data>
    > = $derived(this.createQueryOptions());

    private dataQuery: DataTableUseQueryStoreResult<Data> | undefined;
    private initialized = false;
    private queryKeyPrefix: string | undefined;
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
    constructor(apiFunction: ApiFunction<Data>, additionalQueryOptions: DataTableUseQueryOptions<Data> = {}) {
        super();

        this.apiFunction = apiFunction;
        this.additionalQueryOptions = additionalQueryOptions;
    }

    setConfig(config: FullDataTableConfig<Data>) {
        super.setConfig(config);

        this.queryKeyPrefix = `dataTable-${config.type}`;

        this.initialized = true;
    }

    public requestData(data: PaginatedListRequest<Data>): void {
        if (!this.initialized) {
            throw new Error('Svelte-Query data source was not properly initialized before requesting data');
        }

        this.queryEnabled ??= true;

        this.queryKey = [this.queryKeyPrefix, this.normalizeRequestData(data)];
    }

    private createQuery() {
        this.dataQuery = createQuery({
            ...this.additionalQueryOptions,
            queryKey: this.queryKey,
            queryFn: this.wrapApiFunction(),
            enabled: this.queryEnabled ?? false
        });
    }

    private createQueryOptions(): CreateQueryOptions<
        PaginatedListResponse<Data>,
        unknown,
        PaginatedListResponse<Data>,
        DataTableQueryKey<Data>
    > {
        if (!this.queryKey || !this.apiFunction) {
            return {
                enabled: false
            };
        }

        const queryEnabled = this.additionalQueryOptions.enabled;

        return {
            ...this.additionalQueryOptions,
            queryKey: this.queryKey,
            queryFn: this.wrapApiFunction(),
            enabled: Boolean(this.apiFunction) && queryEnabled
        };
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
