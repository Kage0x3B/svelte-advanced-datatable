import type { DataRecord } from '../types/DataRecord.js';
import type { PaginatedListResponse } from '../types/PaginatedListResponse.js';

export interface QueryObserver<T extends DataRecord = DataRecord> {
	data: PaginatedListResponse<T> | undefined;
	error: Error | undefined;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
}

const loadingQueryObserver: QueryObserver = {
	data: undefined,
	error: undefined,
	isError: false,
	isLoading: true,
	isSuccess: false
};

export function buildLoadingQueryObserver<T extends DataRecord = DataRecord>(): QueryObserver<T> {
	return loadingQueryObserver as QueryObserver<T>;
}

export function buildSuccessQueryObserver<T extends DataRecord = DataRecord>(
	data: PaginatedListResponse<T>
): QueryObserver<T> {
	return {
		data,
		error: undefined,
		isError: false,
		isLoading: false,
		isSuccess: true
	};
}

export function buildErrorQueryObserver<T extends DataRecord = DataRecord>(error: Error): QueryObserver<T> {
	return {
		data: undefined,
		error,
		isError: true,
		isLoading: false,
		isSuccess: false
	};
}
