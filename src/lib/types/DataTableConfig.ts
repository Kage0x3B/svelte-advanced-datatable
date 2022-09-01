import type { SvelteComponentTyped } from 'svelte';
import type { Readable } from 'svelte/store';
import type { TableColumnConfig } from '../dataComponent/ComponentType.js';
import type { IDataSource } from '../dataSource/IDataSource.js';
import type { ForcedSearchQuery } from '../searchParser/ForcedSearchQuery.js';
import type { DataRecord } from './DataRecord.js';
import type { MessageFormatter } from './MessageFormatter.js';
import type { SortDirection } from './SortDirection.js';

export interface ColumnMessageConfig {
	label: string;

	format?: string;

	enumValue?: Record<string, string>;
}

export type MessageConfig<T extends DataRecord = DataRecord> = Record<keyof T, ColumnMessageConfig> & {
	pagination?: {
		previous: string;
		next: string;
		first: string;
		last: string;
	};
};

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

	messageFormatterType?: 'config' | 'svelte-i18n';

	messageConfig?: MessageConfig<T>;

	additionalMessageFormatter?: MessageFormatter;
}

export type FullDataTableConfig<T extends DataRecord = DataRecord> = Required<DataTableConfig<T>>;
