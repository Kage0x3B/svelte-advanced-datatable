import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ExportRunContext } from '$lib/types/Export.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { describe, expect, it } from 'vitest';
import { builtinCsvExporter } from './builtinCsvExporter.js';

const passthroughFormatter: MessageFormatter = (id, options) =>
    options?.default !== undefined ? options.default : id;

const config = {
    type: 'test',
    columnProperties: {}
} as unknown as FullDataTableConfig<unknown>;

function makeCtx(rows: Record<string, unknown>[]): ExportRunContext<unknown> {
    return {
        rows,
        columns: [
            { key: 'id', label: 'ID', colProps: undefined },
            { key: 'name', label: 'Name', colProps: undefined }
        ],
        config,
        format: passthroughFormatter,
        signal: new AbortController().signal,
        baseRequest: {},
        chunkSize: 1000
    };
}

describe('builtinCsvExporter', () => {
    it('produces a kind:"local" descriptor with the expected defaults', () => {
        const e = builtinCsvExporter();
        expect(e.id).toBe('csv');
        expect(e.extension).toBe('csv');
        expect(e.mime).toBe('text/csv;charset=utf-8');
        expect(e.defaultSettings).toMatchObject({ delimiter: ',', includeHeader: true });
        expect(typeof e.run).toBe('function');
        expect(e.settingsComponent).toBeTruthy();
        expect(e.settingsCodec).toBeTruthy();
        expect(e.buildUrl).toBeUndefined();
    });

    it('default run() serializes rows with the supplied settings', async () => {
        const e = builtinCsvExporter();
        const result = await e.run!(
            makeCtx([
                { id: 1, name: 'Ada' },
                { id: 2, name: 'Linus' }
            ]),
            e.defaultSettings
        );
        const obj = result as { content: string; mime: string };
        expect(obj.mime).toBe('text/csv;charset=utf-8');
        expect(obj.content).toBe('ID,Name\n1,Ada\n2,Linus');
    });

    it('overrides merge: custom default delimiter wins', () => {
        const e = builtinCsvExporter({
            defaultSettings: {
                delimiter: ';',
                includeHeader: true,
                utf8Bom: false,
                quoteChar: '"',
                lineEnding: '\n',
                useRawValues: false
            }
        });
        expect(e.defaultSettings.delimiter).toBe(';');
        expect(e.defaultSettings.includeHeader).toBe(true);
    });

    it('overrides can swap extension and mime', () => {
        const e = builtinCsvExporter({ extension: 'tsv', mime: 'text/tab-separated-values' });
        expect(e.extension).toBe('tsv');
        expect(e.mime).toBe('text/tab-separated-values');
    });

    it('overrides can supply a buildUrl alongside the default run', () => {
        const e = builtinCsvExporter({
            buildUrl: (ctx) => `https://example.com/export?cols=${ctx.columns.map((c) => c.key).join(',')}`
        });
        expect(typeof e.buildUrl).toBe('function');
        expect(typeof e.run).toBe('function');
        const url = e.buildUrl!(
            {
                columns: [{ key: 'id', label: 'ID', colProps: undefined }],
                config,
                baseRequest: {}
            },
            e.defaultSettings
        );
        expect(url).toBe('https://example.com/export?cols=id');
    });
});
