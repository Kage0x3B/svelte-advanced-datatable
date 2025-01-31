import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { IDataSource } from './IDataSource.js';
import { QueryResult } from './QueryResult.js';

export abstract class AbstractDataSource<Data> implements IDataSource<Data> {
    protected dataTableConfig: FullDataTableConfig<Data> | undefined = $state();

    private _queryResult: QueryResult<Data> = $state(QueryResult.buildLoading<Data>());

    public get queryResult(): QueryResult<Data> {
        return this._queryResult;
    }

    protected set queryResult(value: QueryResult<Data>) {
        this._queryResult = value;
    }

    public setConfig(config: FullDataTableConfig<Data>): void {
        this.dataTableConfig = config;
    }

    public abstract requestData(data: PaginatedListRequest<Data>): void;
}
