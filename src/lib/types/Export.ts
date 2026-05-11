import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { Codec } from '$lib/persistence/StateStore.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import type { Component } from 'svelte';

/**
 * Encoding mode the built-in field formatter operates in. Internal — the
 * built-in CSV and JSON exporters pass it to `formatFieldForExport` to choose
 * between string serialization and typed JSON primitives. Custom exporters
 * generally won't touch this.
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
 * User-tweakable knobs for CSV exports. Surfaced in the export popover via
 * the built-in CSV settings component.
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
 * Resolved column descriptor passed to every exporter. `label` has already
 * been run through the message formatter so headers match what's on screen.
 */
export interface ExportColumn {
    key: string;
    label: string;
    colProps: ComponentTypeProperties | undefined;
}

/**
 * Argument bundle handed to a {@link LocalExporter}'s `run` callback. Rows
 * are pre-fetched (across all pages, filtered+sorted by the current table
 * state). The `baseRequest`, `fetchOnce`, and `chunkSize` fields are escape
 * hatches for exporters that want to stream rows themselves rather than
 * receive them all in memory.
 */
export interface ExportRunContext<Data = unknown> {
    /** All rows that match the current filter/sort, across every page. */
    rows: Record<string, unknown>[];

    /** Columns the exporter should emit, in render order. */
    columns: ExportColumn[];

    /** The fully-resolved table config. */
    config: FullDataTableConfig<Data>;

    /** Message formatter the table uses for labels, enums, etc. */
    format: MessageFormatter;

    /** Aborted when the user closes the popover or hits cancel. */
    signal: AbortSignal;

    /** Same shape passed to `fetchAllRows` — sort + search, no pagination. */
    baseRequest: Omit<PaginatedListRequest<Data>, 'start' | 'amount'>;

    /**
     * `dataSource.fetchOnce` bound to the current data source. Escape hatch
     * for streaming exporters that want to drive their own chunked fetch
     * instead of consuming the pre-fetched `rows`.
     */
    fetchOnce?: (request: PaginatedListRequest<Data>, signal?: AbortSignal) => Promise<PaginatedListResponse<Data>>;

    /** Same chunk size the library uses for the pre-fetch (default 1000). */
    chunkSize: number;
}

/**
 * Argument bundle handed to a {@link RemoteExporter}'s `buildUrl` callback.
 * No rows — the consumer is producing a URL the browser will navigate to.
 */
export interface ExportBuildUrlContext<Data = unknown> {
    columns: ExportColumn[];
    config: FullDataTableConfig<Data>;
    baseRequest: Omit<PaginatedListRequest<Data>, 'start' | 'amount'>;
}

/**
 * Possible return shapes from a {@link LocalExporter}'s `run` callback.
 *
 * - Plain `string` → wrapped in a `Blob` with the exporter's declared `mime`.
 * - `ArrayBuffer` / typed array → same, wrapped with the declared `mime`.
 * - `Blob` → used as-is.
 * - Object form: override the mime and/or extension for this one download.
 */
export type ExportResult =
    | string
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | { content: string | ArrayBuffer | ArrayBufferView | Blob; mime?: string; extension?: string };

/**
 * Props supplied to a custom settings component. The consumer's component
 * renders form inputs from `settings` and calls `onsettingschange` with a
 * new settings object on every input event.
 */
export interface ExporterSettingsProps<Settings> {
    settings: Settings;
    onsettingschange: (next: Settings) => void;
}

/**
 * Author-facing exporter options for a non-built-in export id (e.g. `xlsx`).
 * The library wraps this into a {@link ResolvedExporter} during config merge.
 *
 * At least one of `run` / `buildUrl` must be provided. If both are present
 * and `buildUrl` returns `undefined` at click time, the popover falls back
 * to `run`.
 */
export interface ExporterOptions<Settings = unknown, Data = unknown> {
    /** File extension (no leading dot), e.g. `'xlsx'`. */
    extension: string;

    /** MIME type used when constructing the download `Blob`. */
    mime: string;

    /** Initial settings the popover uses on first open / after reset. */
    defaultSettings?: Settings;

    /** Optional codec controlling how settings persist across reloads. */
    settingsCodec?: Codec<Settings>;

    /** Optional Svelte component rendered inside the popover when this exporter is selected. */
    settingsComponent?: Component<ExporterSettingsProps<Settings>>;

    /**
     * Build a URL the browser navigates to. Return `undefined` to fall through
     * to `run` (useful for "remote when possible, fall back to in-browser").
     */
    buildUrl?: (ctx: ExportBuildUrlContext<Data>, settings: Settings) => string | undefined;

    /** Produce the file contents in-browser. */
    run?: (ctx: ExportRunContext<Data>, settings: Settings) => ExportResult | Promise<ExportResult>;
}

/**
 * Overrides for the built-in CSV exporter. All fields optional — the library
 * supplies `extension`, `mime`, `run`, default settings + codec, and the
 * settings component.
 */
export type BuiltinCsvExporterOptions<Data = unknown> = Partial<ExporterOptions<ExportCsvOptions, Data>>;

/**
 * Overrides for the built-in JSON exporter. All fields optional.
 */
export type BuiltinJsonExporterOptions<Data = unknown> = Partial<ExporterOptions<Record<string, never>, Data>>;

/**
 * Top-level exports config field on {@link DataTableConfig}.
 *
 * - `false` → disables the export button entirely.
 * - Record → object keys are exporter ids; the iteration order of the keys
 *   drives the order shown in the popover's format `<select>`.
 * - Setting any record value to `false` disables that specific exporter.
 * - Built-in `csv` and `json` keys accept partial overrides; other keys
 *   require a full {@link ExporterOptions} entry.
 * - Omitted entirely → defaults to `{ csv: {}, json: {} }`.
 */
export type ExportersConfig<Data = unknown> =
    | false
    | ({
          csv?: BuiltinCsvExporterOptions<Data> | false;
          json?: BuiltinJsonExporterOptions<Data> | false;
      } & {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [id: string]: ExporterOptions<any, Data> | false | undefined;
      });

/**
 * Internal, fully-resolved exporter. Built by `mergeDataTableConfigDefaults`
 * from the user-supplied {@link ExportersConfig}. Consumers shouldn't
 * construct these directly — use {@link ExporterOptions} in the config.
 */
export interface ResolvedExporter<Settings = unknown, Data = unknown> {
    id: string;
    extension: string;
    mime: string;
    defaultSettings: Settings;
    settingsCodec?: Codec<Settings>;
    settingsComponent?: Component<ExporterSettingsProps<Settings>>;
    buildUrl?: (ctx: ExportBuildUrlContext<Data>, settings: Settings) => string | undefined;
    run?: (ctx: ExportRunContext<Data>, settings: Settings) => ExportResult | Promise<ExportResult>;
}
