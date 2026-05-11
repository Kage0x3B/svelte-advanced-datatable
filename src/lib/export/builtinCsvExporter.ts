import { DEFAULT_EXPORT_CSV_OPTIONS, exportCsvOptionsCodec } from '$lib/persistence/codecs.js';
import type {
    BuiltinCsvExporterOptions,
    ExportCsvOptions,
    ExportRunContext,
    ResolvedExporter
} from '$lib/types/Export.js';
import { serializeCsv, type SerializeCsvColumn } from '$lib/util/exportCsvUtil.js';
import CsvExportSettings from './CsvExportSettings.svelte';

/**
 * Build the default CSV exporter. Pass `overrides` to swap any field —
 * e.g. change the default delimiter, supply a `buildUrl` for server-side
 * generation, or replace the settings component.
 */
export function builtinCsvExporter<Data = unknown>(
    overrides: BuiltinCsvExporterOptions<Data> = {}
): ResolvedExporter<ExportCsvOptions, Data> {
    const defaultSettings: ExportCsvOptions = {
        ...DEFAULT_EXPORT_CSV_OPTIONS,
        ...(overrides.defaultSettings ?? {})
    };

    return {
        id: 'csv',
        extension: overrides.extension ?? 'csv',
        mime: overrides.mime ?? 'text/csv;charset=utf-8',
        defaultSettings,
        settingsCodec: overrides.settingsCodec ?? exportCsvOptionsCodec(),
        settingsComponent: overrides.settingsComponent ?? CsvExportSettings,
        buildUrl: overrides.buildUrl,
        run: overrides.run ?? defaultCsvRun
    };
}

function defaultCsvRun<Data>(ctx: ExportRunContext<Data>, settings: ExportCsvOptions) {
    const columns: SerializeCsvColumn[] = ctx.columns;
    return serializeCsv({
        rows: ctx.rows,
        columns,
        options: settings,
        config: ctx.config as never,
        format: ctx.format
    });
}
