import type { TableColumnConfig } from '$lib/dataComponent/ComponentType.js';
import type { PersistenceOptions } from '$lib/persistence/createStores.svelte.js';
import type { ForcedSearchQuery } from '$lib/searchParser/ForcedSearchQuery.js';
import type { ISearchParser } from '$lib/searchParser/ISearchParser.js';
import type { BuildExportUrl } from '$lib/types/Export.js';
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
    export?: {
        button: string;
        title: string;
        format: string;
        formatCsv: string;
        formatJson: string;
        delimiter: string;
        delimiterComma: string;
        delimiterSemicolon: string;
        delimiterTab: string;
        delimiterPipe: string;
        includeHeader: string;
        advanced: string;
        utf8Bom: string;
        quoteChar: string;
        quoteDouble: string;
        quoteSingle: string;
        lineEnding: string;
        lineEndingLf: string;
        lineEndingCrlf: string;
        useRawValues: string;
        download: string;
        cancel: string;
        close: string;
        preparing: string;
        progress: string;
        progressUnknown: string;
        empty: string;
        error: string;
        retry: string;
        resetDefaults: string;
        localUnavailable: string;
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
     * Maximum amount of rows shown on one page. Acts as the default for the
     * persisted `state.itemsPerPage` — when the user picks a different value
     * via the settings panel, that overrides this.
     */
    itemsPerPage?: number;

    /**
     * Options exposed in the settings popover's "items per page" select.
     * Defaults to `[10, 25, 50, 100, 250]`. Pass an empty array to hide the
     * selector entirely.
     */
    itemsPerPageOptions?: number[];

    /**
     * Hide the settings popover button entirely. Defaults to `false` —
     * the cog icon shows next to the top pagination by default.
     */
    hideSettings?: boolean;

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

    /**
     * If `true`, the modal for the single visible item is opened automatically
     * whenever the dataTable result contains exactly one row.
     *
     * Defaults to `false`.
     */
    autoOpenSingleItem?: boolean;

    /**
     * Delay in milliseconds before a change to the search input is committed to
     * the active search query. Higher values send fewer requests at the cost of
     * a noticeable input lag.
     *
     * Defaults to `200`.
     */
    searchDebounceMs?: number;

    /**
     * Callback fired whenever the active data source reports an error. Use it
     * to surface fetch failures via a toast or logging system. The callback is
     * invoked at most once per distinct error instance.
     */
    onError?: (error: Error) => void;

    /**
     * State persistence configuration. Two independent backends — one for
     * short-lived state (page/search/sort/open) and one for longer-lived UI
     * preferences. Defaults preserve current behavior: the snapshot backend
     * is wired up for transient state (consumers can keep using the existing
     * `capture()`/`restore()` API), and persistent storage is opt-in.
     */
    persistence?: PersistenceOptions;

    /**
     * Hide the export popover button entirely. Defaults to `false` — the
     * download icon shows immediately to the left of the settings cog.
     */
    hideExport?: boolean;

    /**
     * Optional remote-export URL builder. When provided, the export popover
     * renders a download link pointing at this URL instead of fetching all
     * rows locally and serializing in the browser. The callback receives the
     * same request body the api function would receive (sort/search/filters)
     * minus pagination, plus the chosen format and CSV options. Useful for
     * very large exports where the server can stream the file directly.
     */
    buildExportUrl?: BuildExportUrl<Data>;

    /**
     * Maximum number of rows the export popover requests per chunk during a
     * local export. Higher values mean fewer round-trips but larger
     * per-request payloads. Defaults to `1000`.
     */
    exportChunkSize?: number;
}

export type FullDataTableConfig<Data> = Required<DataTableConfig<Data>>;
