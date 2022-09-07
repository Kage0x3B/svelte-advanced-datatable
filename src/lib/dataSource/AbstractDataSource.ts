import { writable } from 'svelte/store';
import type { Readable, Subscriber } from 'svelte/store';
import type { DataRecord } from '../types/DataRecord.js';
import type { FullDataTableConfig } from '../types/DataTableConfig.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import { hasOwnProperty } from '../util/generalUtil.js';
import type { IDataSource } from './IDataSource.js';
import { buildLoadingQueryObserver } from './QueryObserver.js';
import type { QueryObserver } from './QueryObserver.js';

export abstract class AbstractDataSource<T extends DataRecord = DataRecord> implements IDataSource<T> {
	private currentStatus: QueryObserver<T> = buildLoadingQueryObserver();
	private queryObserver: Readable<QueryObserver<T>> = writable(this.currentStatus, (set) => {
		set(this.currentStatus);

		this.setQueryStatus = set;

		return () => (this.setQueryStatus = undefined);
	});
	private setQueryStatus: Subscriber<QueryObserver<T>> | undefined;
	protected dataTableConfig!: FullDataTableConfig<T>;

	init(config: FullDataTableConfig<T>): void {
		this.dataTableConfig = config;
	}

	getQueryObserver(): Readable<QueryObserver<T>> {
		return this.queryObserver;
	}

	protected updateStatus(status: Pick<QueryObserver<T>, 'data'> | Pick<QueryObserver<T>, 'error'>): void {
		const hasData = hasOwnProperty(status, 'data') && !!status.data;
		const hasError = hasOwnProperty(status, 'error') && !!status.error;

		this.currentStatus = {
			isError: hasError,
			isLoading: !hasData && !hasError,
			isSuccess: hasData && !hasError,
			data: undefined,
			error: undefined,
			...status
		};

		this.setQueryStatus && this.setQueryStatus(this.currentStatus);
	}

	public abstract requestData(data: PaginatedListRequest<T>): void;
}
