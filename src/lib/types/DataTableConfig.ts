import type { SvelteComponentTyped } from 'svelte';
import type { Readable } from 'svelte/store';
import type { TableColumnConfig } from '../dataComponent/ComponentType.js';
import type { IDataSource } from '../dataSource/IDataSource.js';
import type { ForcedSearchQuery } from '../searchParser/ForcedSearchQuery.js';
import type { ISearchParser } from '../searchParser/ISearchParser.js';
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
	search?: {
		placeholder: string;
		ariaLabel: string;
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

	itemsPerPage?: number;

	messageFormatterType?: 'config' | 'svelte-i18n';

	/**
	 * Prefix for every message id. Only applies to external message formatters such as the svelte-i18n formatter.
	 */
	messageFormatterPrefix?: string;

	messageConfig?: MessageConfig<T>;

	additionalMessageFormatter?: MessageFormatter;

	showSearch?: boolean;

	searchParser?: ISearchParser;
}

export type FullDataTableConfig<T extends DataRecord = DataRecord> = Required<DataTableConfig<T>>;