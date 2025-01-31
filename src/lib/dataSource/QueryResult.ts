import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';

type LoadingQueryResult<Data> = Omit<QueryResult<Data>, 'data' | 'error'>;
type SuccessQueryResult<Data> = Omit<QueryResult<Data>, 'data' | 'error'> & {
    readonly data: PaginatedListResponse<Data>;
};
type ErrorQueryResult<Data> = Omit<QueryResult<Data>, 'data' | 'error'> & {
    readonly error: Error;
};

export class QueryResult<Data> {
    private constructor(
        public readonly data?: PaginatedListResponse<Data>,
        public readonly error?: Error
    ) {}

    isError(): this is ErrorQueryResult<Data> {
        return Boolean(this.error) && !this.data;
    }

    isLoading(): this is LoadingQueryResult<Data> {
        return !this.data && !this.error;
    }

    isSuccess(): this is SuccessQueryResult<Data> {
        return Boolean(this.data) && !this.error;
    }

    public static buildSuccess<Data>(data: PaginatedListResponse<Data>): QueryResult<Data> {
        return new QueryResult(data);
    }

    public static buildError<Data = unknown>(error: Error): QueryResult<Data> {
        return new QueryResult(undefined, error);
    }

    public static buildLoading<Data = unknown>(): QueryResult<Data> {
        return new QueryResult();
    }
}
