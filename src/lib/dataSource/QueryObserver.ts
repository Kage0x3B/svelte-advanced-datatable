import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';

export interface QueryObserver<Data> {
	data: PaginatedListResponse<Data> | undefined;
	error: Error | undefined;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
}

const loadingQueryObserver: QueryObserver<unknown> = {
	data: undefined,
	error: undefined,
	isError: false,
	isLoading: true,
	isSuccess: false
};

export function buildLoadingQueryObserver<Data>(): QueryObserver<Data> {
	return loadingQueryObserver as QueryObserver<Data>;
}

export function buildSuccessQueryObserver<Data>(data: PaginatedListResponse<Data>): QueryObserver<Data> {
	return {
		data,
		error: undefined,
		isError: false,
		isLoading: false,
		isSuccess: true
	};
}

export function buildErrorQueryObserver(error: Error): QueryObserver<unknown> {
	return {
		data: undefined,
		error,
		isError: true,
		isLoading: false,
		isSuccess: false
	};
}
