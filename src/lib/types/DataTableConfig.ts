import type { SvelteComponentTyped } from 'svelte';
import type { Readable } from 'svelte/store';
import type { TableColumnConfig } from '../dataComponent/ComponentType.js';
import type { IDataSource } from '../dataSource/IDataSource.js';
import type { ForcedSearchQuery } from '../searchParser/ForcedSearchQuery.js';
import type { DataRecord } from './DataRecord.js';
import type { SortDirection } from './SortDirection.js';

export interface DataTableConfig<T extends DataRecord = DataRecord> {
	type: string;

	columnProperties: TableColumnConfig<T>;

	modalComponent?: SvelteComponentTyped;

	onItemClick?: (item: T) => void;

	dataSource: IDataSource<T> | Readable<IDataSource<T>>;

	forcedSearchQuery?: ForcedSearchQuery<T>;

	dataUniquePropertyKey: keyof T & string;

	highlightedItemId?: string | Readable<string | undefined>;

	defaultSort?: { columnKey?: keyof T & string; direction?: SortDirection };

	showPagination?: boolean;

	showTopPagination?: boolean;

	showBottomPagination?: boolean;

	showSearch?: boolean;

	itemsPerPage?: number;
}
