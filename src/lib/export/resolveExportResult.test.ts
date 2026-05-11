import { describe, expect, it } from 'vitest';
import { resolveExportResult } from './resolveExportResult.js';

const exporter = { mime: 'text/csv;charset=utf-8' };

async function blobText(b: Blob): Promise<string> {
    return b.text();
}

describe('resolveExportResult', () => {
    it('wraps a plain string in a Blob with the exporter mime', async () => {
        const { blob, extension } = resolveExportResult('hello,world\n', exporter);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv;charset=utf-8');
        expect(extension).toBeUndefined();
        expect(await blobText(blob)).toBe('hello,world\n');
    });

    it('wraps an ArrayBuffer in a Blob with the exporter mime', () => {
        const buf = new TextEncoder().encode('abc').buffer;
        const { blob } = resolveExportResult(buf, exporter);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('wraps a typed array view in a Blob', () => {
        const view = new Uint8Array([1, 2, 3]);
        const { blob } = resolveExportResult(view, exporter);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('passes an existing Blob through unchanged', async () => {
        const original = new Blob(['x'], { type: 'application/octet-stream' });
        const { blob, extension } = resolveExportResult(original, exporter);
        expect(blob).toBe(original);
        expect(extension).toBeUndefined();
    });

    it('object form: honors mime and extension overrides', async () => {
        const { blob, extension } = resolveExportResult(
            { content: '{"a":1}', mime: 'application/json', extension: 'json' },
            exporter
        );
        expect(blob.type).toBe('application/json');
        expect(extension).toBe('json');
        expect(await blobText(blob)).toBe('{"a":1}');
    });

    it('object form: falls back to exporter mime when none supplied', () => {
        const { blob, extension } = resolveExportResult({ content: 'a' }, exporter);
        expect(blob.type).toBe('text/csv;charset=utf-8');
        expect(extension).toBeUndefined();
    });

    it('object form: rewraps inner blob when mime override differs', () => {
        const inner = new Blob(['x'], { type: 'application/octet-stream' });
        const { blob } = resolveExportResult({ content: inner, mime: 'text/plain' }, exporter);
        expect(blob).not.toBe(inner);
        expect(blob.type).toBe('text/plain');
    });
});
