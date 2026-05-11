import type {
    BuiltinJsonExporterOptions,
    ExportRunContext,
    ResolvedExporter
} from '$lib/types/Export.js';
import { serializeJson, type SerializeJsonColumn } from '$lib/util/exportJsonUtil.js';

/**
 * Build the default JSON exporter. Pass `overrides` to swap any field —
 * e.g. add a `buildUrl` for server-side generation.
 */
export function builtinJsonExporter<Data = unknown>(
    overrides: BuiltinJsonExporterOptions<Data> = {}
): ResolvedExporter<Record<string, never>, Data> {
    return {
        id: 'json',
        extension: overrides.extension ?? 'json',
        mime: overrides.mime ?? 'application/json',
        defaultSettings: (overrides.defaultSettings ?? {}) as Record<string, never>,
        settingsCodec: overrides.settingsCodec,
        settingsComponent: overrides.settingsComponent,
        buildUrl: overrides.buildUrl,
        run: overrides.run ?? defaultJsonRun
    };
}

function defaultJsonRun<Data>(ctx: ExportRunContext<Data>) {
    const columns: SerializeJsonColumn[] = ctx.columns.map(({ key, colProps }) => ({ key, colProps }));
    return serializeJson({
        rows: ctx.rows,
        columns,
        config: ctx.config as never,
        format: ctx.format
    });
}
