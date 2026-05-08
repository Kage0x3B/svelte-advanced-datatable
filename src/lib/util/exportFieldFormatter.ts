import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ExportFormat } from '$lib/types/Export.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { isDateTime } from './generalUtil.js';

/**
 * Tracks `console.warn` we've already emitted for missing `formatValue` on
 * CUSTOM-type columns so each unique column key only nags once per session
 * (mirrors the message-formatter and key-mapping pattern in this codebase).
 */
const warnedCustomColumns = new Set<string>();

/**
 * Coerce a single cell value to its export-side representation. Used by both
 * the CSV writer (always emits a string) and the JSON writer (returns typed
 * primitives where it can).
 *
 * The order of precedence mirrors `InternalDataColumn.svelte`:
 *   1. nullish → empty/null
 *   2. column's `formatValue` (CSV-only by default; JSON skips it for type
 *      fidelity unless the column is STRING and not HTML-rendered)
 *   3. type-specific coercion (DATE / ENUM / BOOLEAN / STRING / NUMBER)
 *   4. CUSTOM falls back to `String(value)`
 */
export interface FormatFieldOptions {
    /**
     * Skip `formatValue` and the message formatter; emit the raw underlying
     * value instead. Used by the CSV writer when the user toggles the
     * "Use raw values" advanced option. JSON exports already prefer raw
     * primitives, so this flag is only ever true for CSV.
     */
    useRawValues?: boolean;
}

export function formatFieldForExport(
    value: unknown,
    item: Record<string, unknown>,
    colProps: ComponentTypeProperties | undefined,
    key: string,
    config: FullDataTableConfig<unknown>,
    format: MessageFormatter,
    exportFormat: ExportFormat,
    options: FormatFieldOptions = {}
): string | number | boolean | null {
    if (value === null || typeof value === 'undefined') {
        return exportFormat === 'json' ? null : '';
    }

    if (!colProps) {
        return primitiveOrFallback(value, exportFormat);
    }

    // Raw mode: bypass everything user-visible (formatValue, format templates,
    // enum/boolean translation) and emit the storage representation. Dates
    // still get coerced to ISO strings since the underlying objects don't
    // round-trip through CSV; everything else falls through `String(value)`.
    if (options.useRawValues && exportFormat === 'csv') {
        if (isDateTime(value)) return value.toISO() ?? value.toString();
        if (value instanceof Date) return value.toISOString();
        return String(value);
    }

    // For CSV, formatValue dictates the displayed string and wins. For JSON,
    // skip it by default — formatters generally return display strings, which
    // would lose type fidelity. Allow opt-in for STRING columns where the
    // result is plain text (no HTML rendering).
    const useFormatValue =
        typeof colProps.formatValue === 'function' &&
        (exportFormat === 'csv' ||
            (colProps.type === ComponentType.STRING && colProps.formatValueEnableHtml !== true));

    if (useFormatValue) {
        const formatted = (colProps.formatValue as (v: unknown, item: unknown) => string)(value, item);
        return colProps.formatValueEnableHtml ? stripHtml(formatted) : formatted;
    }

    switch (colProps.type) {
        case ComponentType.DATE: {
            if (isDateTime(value)) {
                return value.toISO() ?? value.toString();
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return String(value);
        }

        case ComponentType.ENUM: {
            const known = colProps.values.includes(value as string);
            return format(
                `dataTable.${config.type}.${key}.enumValue.${known ? (value as string) : 'unknown'}`,
                { default: String(value) }
            ) as string;
        }

        case ComponentType.BOOLEAN: {
            // Match the on-screen comparison in InternalDataColumn.
            const truthy = colProps.truthy ?? true;
            // eslint-disable-next-line eqeqeq
            const isTrue = colProps.inverted ? value != truthy : value == truthy;
            if (exportFormat === 'json') return isTrue;
            return format(`dataTable.${config.type}.${key}.${isTrue ? 'true' : 'false'}`, {
                default: isTrue ? 'true' : 'false'
            }) as string;
        }

        case ComponentType.NUMBER: {
            if (exportFormat === 'json') {
                const n = typeof value === 'number' ? value : Number(value);
                return Number.isFinite(n) ? n : null;
            }
            // CSV path: respect a configured `format` template (matches the
            // user-visible cell rendering for locale-formatted numbers).
            return format(`dataTable.${config.type}.${key}.format`, {
                default: String(value),
                values: { value: String(value) }
            }) as string;
        }

        case ComponentType.STRING: {
            if (exportFormat === 'json') return String(value);
            return format(`dataTable.${config.type}.${key}.format`, {
                default: String(value),
                values: { value: String(value) }
            }) as string;
        }

        case ComponentType.CUSTOM: {
            // No formatValue and no type-default — best we can do is stringify.
            // Warn once per column so consumers know to add a formatValue.
            if (!warnedCustomColumns.has(key)) {
                warnedCustomColumns.add(key);
                console.warn(
                    `svelte-advanced-datatable: column "${key}" is type CUSTOM and has no formatValue — export falls back to String(value).`
                );
            }
            return primitiveOrFallback(value, exportFormat);
        }

        default:
            return primitiveOrFallback(value, exportFormat);
    }
}

function primitiveOrFallback(value: unknown, exportFormat: ExportFormat): string | number | boolean | null {
    if (exportFormat === 'json') {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value;
        return null;
    }
    return String(value);
}

const HTML_ENTITY_MAP: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
};

/**
 * Minimal HTML-to-text stripper for `formatValueEnableHtml` columns. Strips
 * tags and decodes the most common entities. Consumers needing richer HTML →
 * text conversion should turn off `formatValueEnableHtml` for export columns
 * or supply a plain-text `formatValue`.
 */
function stripHtml(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')
        .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => HTML_ENTITY_MAP[m] ?? m)
        .trim();
}

/** Test-only: reset the warned-once registry. */
export function _resetExportFieldFormatterWarnings(): void {
    warnedCustomColumns.clear();
}
