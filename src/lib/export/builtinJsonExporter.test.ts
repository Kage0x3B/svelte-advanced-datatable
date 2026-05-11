import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ExportRunContext } from '$lib/types/Export.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { describe, expect, it } from 'vitest';
import { builtinJsonExporter } from './builtinJsonExporter.js';

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

describe('builtinJsonExporter', () => {
    it('produces the expected descriptor', () => {
        const e = builtinJsonExporter();
        expect(e.id).toBe('json');
        expect(e.extension).toBe('json');
        expect(e.mime).toBe('application/json');
        expect(e.defaultSettings).toEqual({});
        expect(typeof e.run).toBe('function');
        expect(e.settingsComponent).toBeUndefined();
        expect(e.buildUrl).toBeUndefined();
    });

    it('default run() serializes rows as JSON', async () => {
        const e = builtinJsonExporter();
        const result = (await e.run!(
            makeCtx([
                { id: 1, name: 'Ada' },
                { id: 2, name: 'Linus' }
            ]),
            e.defaultSettings
        )) as { content: string; mime: string };
        expect(result.mime).toBe('application/json');
        const parsed = JSON.parse(result.content);
        expect(parsed).toEqual([
            { id: 1, name: 'Ada' },
            { id: 2, name: 'Linus' }
        ]);
    });

    it('overrides accept a buildUrl', () => {
        const e = builtinJsonExporter({ buildUrl: () => 'https://example.com/export.json' });
        expect(e.buildUrl?.(
            { columns: [], config, baseRequest: {} },
            e.defaultSettings
        )).toBe('https://example.com/export.json');
    });
});
