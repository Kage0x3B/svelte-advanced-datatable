import type { PaginatedListRequest } from './PaginatedListRequest.js';

/**
 * The output format produced by the export popover.
 */
export type ExportFormat = 'csv' | 'json';

/**
 * Column delimiter for CSV exports. The literal `'tab'` is resolved to U+0009
 * by the CSV writer; the persisted value stays human-readable.
 */
export type ExportCsvDelimiter = ',' | ';' | 'tab' | '|';

/**
 * Quote character used to wrap CSV fields that contain the delimiter, the
 * quote character itself, or a newline. RFC 4180 specifies `"`; `'` is offered
 * for niche pipelines. The CSV writer always doubles the quote char inside a
 * field.
 */
export type ExportCsvQuoteChar = '"' | "'";

/**
 * Line terminator between CSV rows. `'\n'` is the cross-platform default;
 * `'\r\n'` is offered for legacy Excel-on-Windows pipelines.
 */
export type ExportCsvLineEnding = '\n' | '\r\n';

/**
 * User-tweakable knobs for CSV exports. Surfaced in the export popover.
 */
export interface ExportCsvOptions {
    /**
     * Field separator. `'tab'` resolves to a literal tab.
     */
    delimiter: ExportCsvDelimiter;

    /**
     * Emit a header row of column labels as the first line.
     */
    includeHeader: boolean;

    /**
     * Prepend a U+FEFF byte-order-mark so Excel auto-detects UTF-8.
     */
    utf8Bom: boolean;

    /**
     * Character used to wrap fields that need quoting.
     */
    quoteChar: ExportCsvQuoteChar;

    /**
     * Line terminator inserted between rows.
     */
    lineEnding: ExportCsvLineEnding;

    /**
     * Skip the message formatter / `formatValue` callbacks and emit the raw
     * underlying values (`String(value)`) instead. Useful for data
     * interchange / re-import flows where you want the original storage
     * representation rather than the user-facing display string. Defaults to
     * `false` (use the same formatted/translated values shown on screen).
     */
    useRawValues: boolean;
}

/**
 * Request shape passed to a remote `buildExportUrl` callback or to the local
 * chunked fetcher. Mirrors {@link PaginatedListRequest} but drops pagination
 * (`start`/`amount`) — exports always cover the full filtered/sorted result —
 * and adds the format/CSV options the consumer might want server-side.
 */
export interface ExportRequest<Data = unknown> extends Omit<PaginatedListRequest<Data>, 'start' | 'amount'> {
    /**
     * Output format the user picked in the popover.
     */
    format: ExportFormat;

    /**
     * Only populated when `format === 'csv'`. JSON exports ignore it.
     */
    csv?: ExportCsvOptions;

    /**
     * Visible+ordered column keys, in the order the user has chosen on screen.
     * Already filtered to drop hidden columns.
     */
    columns: string[];
}

/**
 * URL builder a consumer supplies via `DataTableConfig.buildExportUrl`. When
 * provided, the export popover renders a download link pointing at this URL
 * instead of fetching all rows locally and serializing in the browser. The
 * callback receives the same request body the api function would receive
 * (sort/search/filters) minus pagination, plus the chosen format and CSV
 * options.
 */
export type BuildExportUrl<Data = unknown> = (request: ExportRequest<Data>) => string;
