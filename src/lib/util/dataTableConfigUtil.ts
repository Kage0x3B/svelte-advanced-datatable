import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import { BasicTextSearchParser } from '$lib/searchParser/index.js';
import type { DataTableConfig, FullDataTableConfig, MessageConfig } from '$lib/types/DataTableConfig.js';
import { hasOwnProperty } from './generalUtil.js';

const defaultConfig: Partial<DataTableConfig<unknown>> = {
	modalComponent: undefined,
	onItemClick: undefined,
	forcedSearchQuery: undefined,
	highlightedItemId: undefined,
	defaultSort: {
		columnKey: undefined,
		direction: false
	},
	enablePagination: true,
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
	} as MessageConfig<unknown>,
	enableSearch: true,
	searchParser: new BasicTextSearchParser(),
	showTableHeader: true
};

export function mergeDataTableConfigDefaults<Data>(config: DataTableConfig<Data>): FullDataTableConfig<Data> {
	if (!config) {
		throw new Error('You need to provide a datatable config!');
	}

	const enablePagination = config.enablePagination ?? defaultConfig.enablePagination;
	const itemsPerPage =
		config.itemsPerPage ?? (enablePagination ? defaultConfig.itemsPerPage : Number.MAX_SAFE_INTEGER);

	const fullConfig = {
		...defaultConfig,
		...config,
		itemsPerPage,
		messageConfig: {
			...defaultConfig.messageConfig,
			...config.messageConfig
		}
	} as FullDataTableConfig<Data>;

	if (fullConfig.messageFormatterType === 'config') {
		if (!fullConfig.messageConfig) {
			throw new Error(
				`The DataTable config is missing the messageConfig property, which is required when not using another i18n library.`
			);
		}

		validateMessageConfig(fullConfig);
	}

	return fullConfig;
}

// TODO: Validate presence of all svelte-i18n keys
function validateMessageConfig<Data>(config: FullDataTableConfig<Data>): void {
	for (const columnKey of Object.keys(config.columnProperties)) {
		const columnConfig = config.columnProperties[columnKey as keyof typeof config.columnProperties];

		if (columnConfig!.hidden) {
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

		if (columnConfig!.type === ComponentType.ENUM && !hasOwnProperty(columnMessageConfig, 'enumValue')) {
			console.warn(
				`DataTable ${config.type} message config doesn't provide any enumValue names for enum type column ${columnKey}`
			);
		}

		// @ts-ignore
		config.messageConfig[columnKey] = columnMessageConfig;
	}
}
