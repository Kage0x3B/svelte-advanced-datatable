import type { IDataSource } from '$lib/dataSource/index.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import { getContext, setContext } from 'svelte';

export const DATATABLE_CONFIG_CONTEXT_KEY = 'DATATABLE_CONFIG_CONTEXT_KEY';
export const setConfigContext = (config: () => FullDataTableConfig<unknown>) =>
    setContext(DATATABLE_CONFIG_CONTEXT_KEY, config);
export const getConfigContext = () => getContext<() => FullDataTableConfig<unknown>>(DATATABLE_CONFIG_CONTEXT_KEY);

export const DATATABLE_DATA_SOURCE_CONTEXT_KEY = 'DATATABLE_DATA_SOURCE_CONTEXT_KEY';
export const setDataSourceContext = <Data = unknown>(dataSource: () => IDataSource<Data>) =>
    setContext(DATATABLE_DATA_SOURCE_CONTEXT_KEY, dataSource);
export const getDataSourceContext = <Data = unknown>() =>
    getContext<() => IDataSource<Data>>(DATATABLE_DATA_SOURCE_CONTEXT_KEY);

export const DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY = 'DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY';
export const setMessageFormatterContext = (messageFormatter: () => MessageFormatter) =>
    setContext(DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY, messageFormatter);
export const getMessageFormatterContext = () =>
    getContext<() => MessageFormatter>(DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY);
