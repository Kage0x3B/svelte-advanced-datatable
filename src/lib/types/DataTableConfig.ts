import type { TableColumnConfig } from '$lib/dataComponent/ComponentType.js';
import type { ForcedSearchQuery } from '$lib/searchParser/ForcedSearchQuery.js';
import type { ISearchParser } from '$lib/searchParser/ISearchParser.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { ModalProps } from '$lib/types/ModalProps.js';
import type { Component } from 'svelte';
import type { format as svelteI18nFormat } from 'svelte-i18n';
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
     * A unique identifier/name for this dataTable. Should not contain whitespaces and non-ascii characters
     */
    type: string;

    /**
     * An object with one key for each key in the data, containing configuration options for each table column
     */
    columnProperties: TableColumnConfig<Data>;

    /**
     * The key of your items unique identifier.
     *
     * For example a user id or a counter value which increases by one for each item, as long as it's unique for each item
     */
    dataUniquePropertyKey: keyof Data & string;

    /**
     * Set to `config` to use the messageConfig, pass a {@link MessageFormatter} function or the svelte-i18n formatter to provide all strings used by the dataTable
     */
    messageFormatter?: 'config' | typeof svelteI18nFormat | MessageFormatter;

    /**
     * Prefix for every message id. Only applies to external message formatters such as the svelte-i18n formatter.
     */
    messageFormatterPrefix?: string;

    /**
     * An object containing all strings used by the dataTable, such as table headers, titles of buttons and more.
     *
     * Ignored if svelte-i18n is enabled by using the `messageFormatter` option
     */
    messageConfig?: MessageConfig<Data>;

    /**
     * A svelte component shown when a user clicks on a row to expand it
     */
    modalComponent?: Component<ModalProps<Data>>;

    /**
     * An onClick handler for a table row. Gets passed the data item which the clicked row displays
     * @param item
     */
    onItemClick?: (item: Data) => void;

    /**
     * Build a url which table row. Gets passed the data item which the clicked row displays
     * @param item
     */
    buildItemUrl?: (item: Data) => string;

    /**
     * A search query which overwrites any values by the users current search. Can be used to apply a forced filter to the whole dataTable
     */
    forcedSearchQuery?: ForcedSearchQuery<Data>;

    /**
     * The identifier of any item which then gets assigned the `highlighted` class
     */
    highlightedItemId?: string;

    /**
     * Sort the table using the given key and direction by default
     */
    defaultSort?: { columnKey?: keyof Data | string; direction?: SortDirection };

    /**
     * Whether to enable or disable pagination entirely.
     *
     * Watch out that the server must send all table rows at once if this is disabled.
     */
    enablePagination?: boolean;

    /**
     * If the pagination component at the top of the dataTable should be shown
     */
    showTopPagination?: boolean;

    /**
     * If the pagination component at the bottom of the dataTable should be shown.
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
