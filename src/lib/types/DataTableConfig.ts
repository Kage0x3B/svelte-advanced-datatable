import type { TableColumnConfig } from '$lib/dataComponent/ComponentType.js';
import type { IDataSource } from '$lib/dataSource/IDataSource.js';
import type { ForcedSearchQuery } from '$lib/searchParser/ForcedSearchQuery.js';
import type { ISearchParser } from '$lib/searchParser/ISearchParser.js';
import type { SvelteComponentTyped } from 'svelte';
import type { Readable } from 'svelte/store';
import type { MessageFormatter } from './MessageFormatter.js';
import type { SortDirection } from './SortDirection.js';

export interface ColumnMessageConfig {
    label: string;

    format?: string;

    enumValue?: Record<string, string>;
}

export type MessageConfig<Data> = Partial<Record<keyof Data, ColumnMessageConfig>> & {
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

export interface DataTableConfig<Data> {
    /**
     * A unique identifier/name for this datatable. Should not contain whitespaces and non-ascii characters
     */
    type: string;

    /**
     * An object with one key for each key in the data, containing configuration options for each table column
     */
    columnProperties: TableColumnConfig<Data>;

    /**
     * The data source where the datatable requests the table data from
     */
    dataSource: IDataSource<Data> | Readable<IDataSource<Data>>;

    /**
     * The key of your items unique identifier.
     *
     * For example a user id or a counter value which increases by one for each item, as long as it's unique for each item
     */
    dataUniquePropertyKey: keyof Data & string;

    /**
     * Whether to use the messageConfig or the svelte-i18n library to provide all strings used by the datatable
     */
    messageFormatterType?: 'config' | 'svelte-i18n';

    /**
     * Prefix for every message id. Only applies to external message formatters such as the svelte-i18n formatter.
     */
    messageFormatterPrefix?: string;

    /**
     * An object containing all strings used by the datatable, such as table headers, titles of buttons and more.
     *
     * Ignored if svelte-i18n is enabled by the `messageFormatterType` option
     */
    messageConfig?: MessageConfig<Data>;

    /**
     * A custom message formatter which can return a replacement or undefined to default to the message provided by the internal formatter/svelte-i18n
     */
    additionalMessageFormatter?: MessageFormatter;

    /**
     * A svelte component shown when a user clicks on a row to expand it
     */
    modalComponent?: SvelteComponentTyped;

    /**
     * An onClick handler for a table row. Gets passed the data item which the clicked row displays
     * @param item
     */
    onItemClick?: (item: Data) => void;

    /**
     * A search query which overwrites any values by the users current search. Can be used to apply a forced filter to the whole datatable
     */
    forcedSearchQuery?: Readable<ForcedSearchQuery<Data>>;

    /**
     * The identifier of any item which then gets assigned the `highlighted` class
     */
    highlightedItemId?: string | Readable<string | undefined>;

    /**
     * Sort the table using the given key and direction by default
     */
    defaultSort?: { columnKey?: keyof Data & string; direction?: SortDirection };

    /**
     * Whether to enable or disable pagination entirely.
     *
     * Watch out that the server must send all table rows at once if this is disabled.
     */
    enablePagination?: boolean;

    /**
     * If the pagination component at the top of the datatable should be shown
     */
    showTopPagination?: boolean;

    /**
     * If the pagination component at the bottom of the datatable should be shown.
     *
     * Notice that the bottom pagination is always hidden when less than 10 rows are shown
     */
    showBottomPagination?: boolean;

    /**
     * Maximum amount of rows shown on one page
     */
    itemsPerPage?: number;

    /**
     * Whether to show the search textbox
     */
    enableSearch?: boolean;

    /**
     * Which search parser to use to parse the users search text into search filters, categories and more
     */
    searchParser?: ISearchParser;

    /**
     * Whether to show the table header row.
     *
     * Tables without a header are not sortable!
     */
    showTableHeader?: boolean;
}

export type FullDataTableConfig<Data> = Required<DataTableConfig<Data>>;
