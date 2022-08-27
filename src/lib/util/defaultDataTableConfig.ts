import type { DataRecord } from '../types/DataRecord.js';
import type { DataTableConfig } from '../types/DataTableConfig.js';

const defaultDataTableConfig = {
	modalComponent: undefined,
	onItemClick: undefined,
	forcedSearchQuery: undefined,
	highlightedItemId: undefined,
	defaultSort: {
		columnKey: undefined,
		direction: false
	},
	showPagination: true,
	showTopPagination: true,
	showBottomPagination: true,
	showSearch: true,
	itemsPerPage: 50
} as DataTableConfig;

export function mergeDataTableConfigDefaults<T extends DataRecord>(
	config: DataTableConfig<T>
): Required<DataTableConfig<T>> {
	const showPagination = config.showPagination ?? defaultDataTableConfig.showPagination;
	const itemsPerPage =
		config.itemsPerPage ?? (showPagination ? defaultDataTableConfig.itemsPerPage : Number.MAX_SAFE_INTEGER);

	return {
		...defaultDataTableConfig,
		...config,
		itemsPerPage
	} as Required<DataTableConfig<T>>;
}
