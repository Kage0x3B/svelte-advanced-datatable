import { ComponentType } from '../dataComponent/ComponentType.js';
import { BasicTextSearchParser } from '../searchParser/BasicTextSearchParser.js';
import type { DataRecord } from '../types/DataRecord.js';
import type { DataTableConfig, FullDataTableConfig, MessageConfig } from '../types/DataTableConfig.js';
import { hasOwnProperty } from './generalUtil.js';

const defaultConfig: Partial<DataTableConfig> = {
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
	itemsPerPage: 50,
	messageFormatterType: 'config',
	messageFormatterPrefix: '',
	messageConfig: {
		pagination: {
			previous: 'Previous',
			next: 'Next',
			first: 'First',
			last: 'Last'
		},
		search: {
			placeholder: 'Search',
			ariaLabel: 'Search'
		}
	} as MessageConfig,
	showSearch: true,
	searchParser: new BasicTextSearchParser()
};

export function mergeDataTableConfigDefaults<T extends DataRecord>(config: DataTableConfig<T>): FullDataTableConfig<T> {
	const showPagination = config.showPagination ?? defaultConfig.showPagination;
	const itemsPerPage = config.itemsPerPage ?? (showPagination ? defaultConfig.itemsPerPage : Number.MAX_SAFE_INTEGER);

	const fullConfig = {
		...defaultConfig,
		...config,
		itemsPerPage,
		messageConfig: {
			...defaultConfig.messageConfig,
			...config.messageConfig
		}
	} as FullDataTableConfig<T>;

	if (fullConfig.messageFormatterType === 'config') {
		if (!fullConfig.messageConfig) {
			throw new Error(
				`The DataTable config is missing the messageConfig property, which is required when not using another i18n library.`
			);
		}

		validateMessageConfig(<FullDataTableConfig>fullConfig);
	}

	return fullConfig;
}

// TODO: Validate presence of all svelte-i18n keys
function validateMessageConfig(config: FullDataTableConfig): void {
	for (const columnKey of Object.keys(config.columnProperties)) {
		const columnConfig = config.columnProperties[columnKey];

		if (columnConfig.cellHidden) {
			continue;
		}

		if (!hasOwnProperty(config.messageConfig, columnKey)) {
			console.warn(
				`DataTable ${config.type} message config doesn't provide any data and no label for column ${columnKey}`
			);

			continue;
		}

		const columnMessageConfig = config.messageConfig[columnKey];

		if (!hasOwnProperty(columnMessageConfig, 'label')) {
			console.warn(`DataTable ${config.type} message config doesn't provide a label for column ${columnKey}`);
		}

		if (columnConfig.type === ComponentType.ENUM && !hasOwnProperty(columnMessageConfig, 'enumValue')) {
			console.warn(
				`DataTable ${config.type} message config doesn't provide any enumValue names for enum type column ${columnKey}`
			);
		}

		config.messageConfig[columnKey] = columnMessageConfig;
	}
}
