import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ExportCsvDelimiter, ExportCsvOptions } from '$lib/types/Export.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { formatFieldForExport } from './exportFieldFormatter.js';

export interface SerializeCsvColumn {
    key: string;
    label: string;
    colProps: ComponentTypeProperties | undefined;
}

export interface SerializeCsvParams {
    rows: Record<string, unknown>[];
    columns: SerializeCsvColumn[];
    options: ExportCsvOptions;
    config: FullDataTableConfig<unknown>;
    format: MessageFormatter;
}

export interface SerializedExport {
    content: string;
    mime: string;
}

/**
 * RFC 4180-compliant CSV writer. Returns the file content (with optional BOM)
 * and the mime string the consumer should use when constructing a Blob.
 */
export function serializeCsv({ rows, columns, options, config, format }: SerializeCsvParams): SerializedExport {
    const delim = resolveDelimiter(options.delimiter);
    const quote = options.quoteChar;
    const lineEnding = options.lineEnding;

    const lines: string[] = [];

    if (options.includeHeader) {
        lines.push(columns.map((c) => escapeCsvField(c.label, delim, quote)).join(delim));
    }

    for (const row of rows) {
        const cells = columns.map((c) => {
            const raw = formatFieldForExport(row[c.key], row, c.colProps, c.key, config, format, 'csv', {
                useRawValues: options.useRawValues
            });
            return escapeCsvField(raw == null ? '' : String(raw), delim, quote);
        });
        lines.push(cells.join(delim));
    }

    const body = lines.join(lineEnding);
    const content = options.utf8Bom ? '﻿' + body : body;

    return {
        content,
        mime: 'text/csv;charset=utf-8'
    };
}

/**
 * Resolve the persisted `'tab'` literal into a real tab character. All other
 * delimiter values pass through.
 */
export function resolveDelimiter(delim: ExportCsvDelimiter): string {
    return delim === 'tab' ? '\t' : delim;
}

/**
 * RFC 4180 escape: quote when the value contains the delimiter, the quote
 * char, a CR/LF, or has leading/trailing whitespace. Inside a quoted field,
 * the quote character is doubled.
 */
export function escapeCsvField(raw: string, delimiter: string, quote: string): string {
    if (raw === '') return '';
    const needsQuoting =
        raw.includes(delimiter) ||
        raw.includes(quote) ||
        raw.includes('\n') ||
        raw.includes('\r') ||
        raw.startsWith(' ') ||
        raw.endsWith(' ');
    if (!needsQuoting) return raw;
    const doubled = raw.split(quote).join(quote + quote);
    return `${quote}${doubled}${quote}`;
}
