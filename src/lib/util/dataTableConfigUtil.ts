import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import { builtinCsvExporter } from '$lib/export/builtinCsvExporter.js';
import { builtinJsonExporter } from '$lib/export/builtinJsonExporter.js';
import { BasicTextSearchParser } from '$lib/searchParser/index.js';
import type { DataTableConfig, FullDataTableConfig, MessageConfig } from '$lib/types/DataTableConfig.js';
import type { ExporterOptions, ExportersConfig, ResolvedExporter } from '$lib/types/Export.js';
import { hasOwnProperty } from './generalUtil.js';

const defaultConfig: Partial<DataTableConfig<unknown>> = {
    modalComponent: undefined,
    onItemClick: undefined,
    buildItemUrl: undefined,
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
    messageFormatter: 'config',
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
        },
        export: {
            button: 'Export',
            title: 'Export data',
            format: 'Format',
            formats: {
                csv: 'CSV',
                json: 'JSON'
            },
            delimiter: 'Delimiter',
            delimiterComma: 'Comma (,)',
            delimiterSemicolon: 'Semicolon (;) — Excel (DE)',
            delimiterTab: 'Tab',
            delimiterPipe: 'Pipe (|)',
            includeHeader: 'Include header row',
            advanced: 'Advanced options',
            utf8Bom: 'UTF-8 BOM (Excel)',
            quoteChar: 'Quote character',
            quoteDouble: 'Double quote (")',
            quoteSingle: "Single quote (')",
            lineEnding: 'Line ending',
            lineEndingLf: 'LF (\\n)',
            lineEndingCrlf: 'CRLF (\\r\\n)',
            useRawValues: 'Use raw values (skip formatters/translations)',
            download: 'Download',
            cancel: 'Cancel',
            close: 'Close',
            preparing: 'Preparing export…',
            progress: 'Loaded {loaded} of {total}',
            progressUnknown: 'Loaded {loaded}',
            empty: 'No rows match the current filter.',
            error: 'Export failed: {message}',
            retry: 'Retry',
            resetDefaults: 'Reset to defaults',
            localUnavailable: 'Local export is not supported for this data source.'
        },
        actions: {
            selectedCount: '{count} selected',
            moreActions: 'More actions',
            clearSelection: 'Clear selection',
            rowActions: 'Actions',
            selectRow: 'Select row',
            selectAllOnPage: 'Select all on page'
        }
    } as MessageConfig<unknown>,
    enableSearch: true,
    searchParser: new BasicTextSearchParser(),
    showTableHeader: true,
    autoOpenSingleItem: false,
    searchDebounceMs: 200,
    onError: undefined,
    persistence: {},
    itemsPerPageOptions: [10, 25, 50, 100, 250],
    hideSettings: false,
    hideExport: false,
    exporters: undefined,
    exportChunkSize: 1000,
    actions: [],
    selection: {
        enabled: undefined,
        selectableRows: undefined,
        hideRowActionsColumn: false,
        primaryActionsCount: 2
    }
};

export function mergeDataTableConfigDefaults<Data>(config: DataTableConfig<Data>): FullDataTableConfig<Data> {
    if (!config) {
        throw new Error('You need to provide a dataTable config!');
    }

    const enablePagination = config.enablePagination ?? defaultConfig.enablePagination;
    const itemsPerPage =
        config.itemsPerPage ?? (enablePagination ? defaultConfig.itemsPerPage : Number.MAX_SAFE_INTEGER);

    const defaultActions = defaultConfig.messageConfig?.actions;
    const userActions = config.messageConfig?.actions;
    const mergedActions = userActions ? { ...defaultActions, ...userActions } : defaultActions;

    const defaultFormats = defaultConfig.messageConfig?.export?.formats;
    const userFormats = config.messageConfig?.export?.formats;
    const mergedFormats = userFormats ? { ...defaultFormats, ...userFormats } : defaultFormats;
    const mergedExport =
        config.messageConfig?.export || defaultFormats
            ? {
                  ...defaultConfig.messageConfig?.export,
                  ...config.messageConfig?.export,
                  formats: mergedFormats as Record<string, string>
              }
            : defaultConfig.messageConfig?.export;

    const resolvedExporters = resolveExporters<Data>(config.exporters, config.hideExport);

    const fullConfig = {
        ...defaultConfig,
        ...config,
        itemsPerPage,
        resolvedExporters,
        messageConfig: {
            ...defaultConfig.messageConfig,
            ...config.messageConfig,
            actions: mergedActions,
            export: mergedExport
        },
        selection: {
            ...defaultConfig.selection,
            ...config.selection
        }
    } as FullDataTableConfig<Data>;

    if (fullConfig.messageFormatter === 'config') {
        if (!fullConfig.messageConfig) {
            throw new Error(
                `The DataTable config is missing the messageConfig property, which is required when not using another i18n library.`
            );
        }

        validateMessageConfig(fullConfig);
    }

    return fullConfig;
}

/**
 * Resolve the user-facing `exporters` config record into an ordered array of
 * {@link ResolvedExporter}. Iteration order of the record's keys is the
 * order shown in the format select.
 *
 * - `false` → no exporters.
 * - `undefined` → `{ csv: {}, json: {} }`.
 * - `csv`/`json` keys → built-in factories, with overrides shallow-merged.
 * - Any other key → an {@link ExporterOptions} entry (must have `extension`,
 *   `mime`, and at least one of `run` / `buildUrl`). Throws otherwise.
 * - Any value of `false` → that exporter is skipped.
 *
 * `legacyHideExport` is the deprecated `hideExport` flag — honored only when
 * `exporters` is left unset; ignored otherwise.
 */
function resolveExporters<Data>(
    exporters: ExportersConfig<Data> | undefined,
    legacyHideExport: boolean | undefined
): ResolvedExporter<unknown, Data>[] {
    if (exporters === false) return [];
    if (exporters === undefined) {
        if (legacyHideExport) return [];
        return [
            builtinCsvExporter<Data>() as ResolvedExporter<unknown, Data>,
            builtinJsonExporter<Data>() as ResolvedExporter<unknown, Data>
        ];
    }

    const out: ResolvedExporter<unknown, Data>[] = [];
    for (const [id, value] of Object.entries(exporters)) {
        if (value === false || value === undefined) continue;
        if (id === 'csv') {
            out.push(builtinCsvExporter<Data>(value as Parameters<typeof builtinCsvExporter<Data>>[0]) as ResolvedExporter<unknown, Data>);
            continue;
        }
        if (id === 'json') {
            out.push(builtinJsonExporter<Data>(value as Parameters<typeof builtinJsonExporter<Data>>[0]) as ResolvedExporter<unknown, Data>);
            continue;
        }
        out.push(resolveCustomExporter<Data>(id, value as ExporterOptions<unknown, Data>));
    }
    return out;
}

function resolveCustomExporter<Data>(
    id: string,
    options: ExporterOptions<unknown, Data>
): ResolvedExporter<unknown, Data> {
    if (!options || typeof options !== 'object') {
        throw new Error(`Exporter "${id}": expected an options object.`);
    }
    if (typeof options.extension !== 'string' || !options.extension) {
        throw new Error(`Exporter "${id}": \`extension\` is required.`);
    }
    if (typeof options.mime !== 'string' || !options.mime) {
        throw new Error(`Exporter "${id}": \`mime\` is required.`);
    }
    if (typeof options.run !== 'function' && typeof options.buildUrl !== 'function') {
        throw new Error(`Exporter "${id}": at least one of \`run\` or \`buildUrl\` must be provided.`);
    }
    return {
        id,
        extension: options.extension,
        mime: options.mime,
        defaultSettings: (options.defaultSettings ?? {}) as unknown,
        settingsCodec: options.settingsCodec,
        settingsComponent: options.settingsComponent,
        buildUrl: options.buildUrl,
        run: options.run
    };
}

// TODO: Validate presence of all svelte-i18n keys
function validateMessageConfig<Data>(config: FullDataTableConfig<Data>): void {
    for (const columnKey of Object.keys(config.columnProperties) as (keyof Data & string)[]) {
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
    }
}
