import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ExportCsvOptions } from '$lib/types/Export.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { describe, expect, it } from 'vitest';
import { escapeCsvField, resolveDelimiter, serializeCsv, type SerializeCsvColumn } from './exportCsvUtil.js';

const DEFAULT_OPTIONS: ExportCsvOptions = {
    delimiter: ',',
    includeHeader: true,
    utf8Bom: false,
    quoteChar: '"',
    lineEnding: '\n',
    useRawValues: false
};

const passthroughFormatter: MessageFormatter = (id, options) =>
    options?.default !== undefined ? options.default : id;

const config = {
    type: 'test',
    columnProperties: {} as Record<string, ComponentTypeProperties>
} as unknown as FullDataTableConfig<unknown>;

describe('resolveDelimiter', () => {
    it('returns the literal for primitive choices', () => {
        expect(resolveDelimiter(',')).toBe(',');
        expect(resolveDelimiter(';')).toBe(';');
        expect(resolveDelimiter('|')).toBe('|');
    });
    it('expands tab to a real tab character', () => {
        expect(resolveDelimiter('tab')).toBe('\t');
    });
});

describe('escapeCsvField', () => {
    it('returns plain text unchanged', () => {
        expect(escapeCsvField('hello', ',', '"')).toBe('hello');
    });

    it('quotes when the delimiter appears in the field', () => {
        expect(escapeCsvField('a,b', ',', '"')).toBe('"a,b"');
    });

    it('quotes and doubles the quote char', () => {
        expect(escapeCsvField('say "hi"', ',', '"')).toBe('"say ""hi"""');
    });

    it('quotes when newlines appear', () => {
        expect(escapeCsvField('line1\nline2', ',', '"')).toBe('"line1\nline2"');
    });

    it('quotes leading/trailing whitespace', () => {
        expect(escapeCsvField(' padded ', ',', '"')).toBe('" padded "');
    });

    it('handles single-quote mode by doubling single quotes', () => {
        expect(escapeCsvField("it's", ',', "'")).toBe("'it''s'");
    });
});

describe('serializeCsv', () => {
    function buildColumns(): SerializeCsvColumn[] {
        return [
            { key: 'name', label: 'Name', colProps: { type: ComponentType.STRING } as ComponentTypeProperties },
            { key: 'email', label: 'Email', colProps: { type: ComponentType.STRING } as ComponentTypeProperties }
        ];
    }

    it('emits header + rows with default options', () => {
        const result = serializeCsv({
            rows: [
                { name: 'Alice', email: 'a@example.com' },
                { name: 'Bob', email: 'b@example.com' }
            ],
            columns: buildColumns(),
            options: DEFAULT_OPTIONS,
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('Name,Email\nAlice,a@example.com\nBob,b@example.com');
        expect(result.mime).toBe('text/csv;charset=utf-8');
    });

    it('skips the header when includeHeader is false', () => {
        const result = serializeCsv({
            rows: [{ name: 'Alice', email: 'a@example.com' }],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, includeHeader: false },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('Alice,a@example.com');
    });

    it('prepends a UTF-8 BOM when utf8Bom is true', () => {
        const result = serializeCsv({
            rows: [],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, utf8Bom: true, includeHeader: true },
            config,
            format: passthroughFormatter
        });
        expect(result.content.charCodeAt(0)).toBe(0xfeff);
    });

    it('uses CRLF line endings when configured', () => {
        const result = serializeCsv({
            rows: [{ name: 'Alice', email: 'a@example.com' }],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, lineEnding: '\r\n' },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('Name,Email\r\nAlice,a@example.com');
    });

    it('uses tab as delimiter when configured', () => {
        const result = serializeCsv({
            rows: [{ name: 'Alice', email: 'a@example.com' }],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, delimiter: 'tab' },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('Name\tEmail\nAlice\ta@example.com');
    });

    it('quotes fields containing the delimiter', () => {
        const result = serializeCsv({
            rows: [{ name: 'Doe, John', email: 'a@example.com' }],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, includeHeader: false },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('"Doe, John",a@example.com');
    });

    it('writes empty cell for nullish values', () => {
        const result = serializeCsv({
            rows: [{ name: null, email: undefined }],
            columns: buildColumns(),
            options: { ...DEFAULT_OPTIONS, includeHeader: false },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe(',');
    });

    it('uses formatValue when provided', () => {
        const result = serializeCsv({
            rows: [{ price: 1234 }],
            columns: [
                {
                    key: 'price',
                    label: 'Price',
                    colProps: {
                        type: ComponentType.NUMBER,
                        formatValue: (v: unknown) => `$${v}`
                    } as unknown as ComponentTypeProperties
                }
            ],
            options: { ...DEFAULT_OPTIONS, includeHeader: false },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('$1234');
    });

    it('skips formatValue when useRawValues is true', () => {
        const result = serializeCsv({
            rows: [{ price: 1234 }],
            columns: [
                {
                    key: 'price',
                    label: 'Price',
                    colProps: {
                        type: ComponentType.NUMBER,
                        formatValue: (v: unknown) => `$${v}`
                    } as unknown as ComponentTypeProperties
                }
            ],
            options: { ...DEFAULT_OPTIONS, includeHeader: false, useRawValues: true },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('1234');
    });

    it('strips HTML when formatValueEnableHtml is true', () => {
        const result = serializeCsv({
            rows: [{ desc: 'rich' }],
            columns: [
                {
                    key: 'desc',
                    label: 'Description',
                    colProps: {
                        type: ComponentType.STRING,
                        formatValue: () => '<strong>bold &amp; italic</strong>',
                        formatValueEnableHtml: true
                    } as unknown as ComponentTypeProperties
                }
            ],
            options: { ...DEFAULT_OPTIONS, includeHeader: false },
            config,
            format: passthroughFormatter
        });
        expect(result.content).toBe('bold & italic');
    });
});
