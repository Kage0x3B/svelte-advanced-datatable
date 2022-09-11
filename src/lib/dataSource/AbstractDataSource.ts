import type { Readable, Subscriber } from 'svelte/store';
import { writable } from 'svelte/store';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import { hasOwnProperty } from '$lib/util/generalUtil.js';
import type { IDataSource } from './IDataSource.js';
import type { QueryObserver } from './QueryObserver.js';
import { buildLoadingQueryObserver } from './QueryObserver.js';

export abstract class AbstractDataSource<Data> implements IDataSource<Data> {
	private currentStatus: QueryObserver<Data> = buildLoadingQueryObserver();
	private queryObserver: Readable<QueryObserver<Data>> = writable(this.currentStatus, (set) => {
		set(this.currentStatus);

		this.setQueryStatus = set;

		return () => (this.setQueryStatus = undefined);
	});
	private setQueryStatus: Subscriber<QueryObserver<Data>> | undefined;
	protected dataTableConfig!: FullDataTableConfig<Data>;

	init(config: FullDataTableConfig<Data>): void {
		this.dataTableConfig = config;
	}

	getQueryObserver(): Readable<QueryObserver<Data>> {
		return this.queryObserver;
	}

	protected updateStatus(status: Pick<QueryObserver<Data>, 'data'> | Pick<QueryObserver<Data>, 'error'>): void {
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

	public abstract requestData(data: PaginatedListRequest<Data>): void;
}
