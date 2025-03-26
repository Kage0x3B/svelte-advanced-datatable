import type { IDataSource } from '$lib/dataSource/IDataSource.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import { Context } from 'runed';
import type { ReadableBox } from 'svelte-toolbelt';

export const configContext = new Context<ReadableBox<FullDataTableConfig<unknown>>>('DATATABLE_CONFIG_CONTEXT_KEY');

export const dataSourceContext = new Context<ReadableBox<IDataSource<unknown>>>('DATATABLE_DATA_SOURCE_CONTEXT_KEY');

export const messageFormatterContext = new Context<ReadableBox<MessageFormatter>>(
    'DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY'
);
