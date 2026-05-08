import type {
    ExportCsvDelimiter,
    ExportCsvLineEnding,
    ExportCsvOptions,
    ExportCsvQuoteChar,
    ExportFormat
} from '$lib/types/Export.js';
import type { SortDirection } from '$lib/types/SortDirection.js';
import type { Codec } from './StateStore.js';

export const numberCodec: Codec<number> = {
    encode: (v) => String(v),
    decode: (raw) => {
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    }
};

export const stringCodec: Codec<string> = {
    encode: (v) => v,
    decode: (raw) => raw
};

export const optionalStringCodec: Codec<string | undefined> = {
    encode: (v) => (v === undefined ? '' : v),
    decode: (raw) => (raw === '' ? undefined : raw)
};

export const optionalNumberCodec: Codec<number | undefined> = {
    encode: (v) => (v === undefined ? '' : String(v)),
    decode: (raw) => {
        if (raw === '') return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
    }
};

export const sortDirectionCodec: Codec<SortDirection> = {
    encode: (v) => (v === false ? '' : v),
    decode: (raw) => (raw === 'asc' || raw === 'desc' ? raw : false)
};

/**
 * JSON codec for plain `Record<string, T>` values (column visibility, widths,
 * etc.). Default-elision treats two records as equal when they have the same
 * keys mapped to the same values, regardless of insertion order. Decode is
 * lenient: malformed JSON or non-record shapes fall back to `{}`.
 */
export function jsonRecordCodec<T>(): Codec<Record<string, T>> {
    return {
        encode: (v) => JSON.stringify(v),
        decode: (raw) => {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed as Record<string, T>;
                }
            } catch {
                // fall through
            }
            return {};
        },
        isEqual: (a, b) => {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            for (const key of aKeys) {
                if (!Object.is(a[key], b[key])) return false;
            }
            return true;
        }
    };
}

/**
 * JSON codec for ordered `string[]` values (column order). Default-elision
 * compares element-wise, so `['a','b']` and `['a','b']` round-trip as equal
 * but `['a','b']` and `['b','a']` do not. Decode is lenient: malformed JSON
 * or non-array shapes fall back to `[]`.
 */
export function jsonStringArrayCodec(): Codec<string[]> {
    return {
        encode: (v) => JSON.stringify(v),
        decode: (raw) => {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.every((entry) => typeof entry === 'string')) {
                    return parsed;
                }
            } catch {
                // fall through
            }
            return [];
        },
        isEqual: (a, b) => {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
    };
}

const DENSITY_VALUES = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Codec for the optional density field. `undefined` round-trips as the empty
 * string and falls back through default-elision; any unrecognized value
 * decodes to `undefined`.
 */
export const densityCodec: Codec<'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined> = {
    encode: (v) => (v === undefined ? '' : v),
    decode: (raw) => (DENSITY_VALUES.has(raw) ? (raw as 'xs' | 'sm' | 'md' | 'lg' | 'xl') : undefined)
};

/**
 * JSON codec for the multi-sort tail (`additionalSort`). Each entry is
 * `{ column: string; direction: 'asc' | 'desc' }`; malformed entries get
 * dropped to keep a half-corrupt URL/storage value from crashing decode.
 */
/**
 * Codec for the export-popover format pick. Falls back to `'csv'` for any
 * value other than `'csv'`/`'json'` (typo, manual storage edit, etc.).
 */
export const exportFormatCodec: Codec<ExportFormat> = {
    encode: (v) => v,
    decode: (raw) => (raw === 'json' ? 'json' : 'csv')
};

const VALID_DELIMITERS: ExportCsvDelimiter[] = [',', ';', 'tab', '|'];
const VALID_QUOTES: ExportCsvQuoteChar[] = ['"', "'"];
const VALID_LINE_ENDINGS: ExportCsvLineEnding[] = ['\n', '\r\n'];

export const DEFAULT_EXPORT_CSV_OPTIONS: ExportCsvOptions = {
    delimiter: ',',
    includeHeader: true,
    utf8Bom: false,
    quoteChar: '"',
    lineEnding: '\n',
    useRawValues: false
};

/**
 * JSON codec for the entire `ExportCsvOptions` bag. We persist it as one
 * storage entry to keep the key footprint small. Decode is defensive — every
 * field individually falls back to its default when missing/invalid, so a
 * partially-corrupt blob still gives the user a working set of options.
 */
export function exportCsvOptionsCodec(): Codec<ExportCsvOptions> {
    return {
        encode: (v) => JSON.stringify(v),
        decode: (raw) => {
            try {
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_EXPORT_CSV_OPTIONS };
                return {
                    delimiter: VALID_DELIMITERS.includes(parsed.delimiter)
                        ? parsed.delimiter
                        : DEFAULT_EXPORT_CSV_OPTIONS.delimiter,
                    includeHeader:
                        typeof parsed.includeHeader === 'boolean'
                            ? parsed.includeHeader
                            : DEFAULT_EXPORT_CSV_OPTIONS.includeHeader,
                    utf8Bom: typeof parsed.utf8Bom === 'boolean' ? parsed.utf8Bom : DEFAULT_EXPORT_CSV_OPTIONS.utf8Bom,
                    quoteChar: VALID_QUOTES.includes(parsed.quoteChar)
                        ? parsed.quoteChar
                        : DEFAULT_EXPORT_CSV_OPTIONS.quoteChar,
                    lineEnding: VALID_LINE_ENDINGS.includes(parsed.lineEnding)
                        ? parsed.lineEnding
                        : DEFAULT_EXPORT_CSV_OPTIONS.lineEnding,
                    useRawValues:
                        typeof parsed.useRawValues === 'boolean'
                            ? parsed.useRawValues
                            : DEFAULT_EXPORT_CSV_OPTIONS.useRawValues
                };
            } catch {
                return { ...DEFAULT_EXPORT_CSV_OPTIONS };
            }
        },
        isEqual: (a, b) =>
            a.delimiter === b.delimiter &&
            a.includeHeader === b.includeHeader &&
            a.utf8Bom === b.utf8Bom &&
            a.quoteChar === b.quoteChar &&
            a.lineEnding === b.lineEnding &&
            a.useRawValues === b.useRawValues
    };
}

export function additionalSortCodec(): Codec<Array<{ column: string; direction: 'asc' | 'desc' }>> {
    type Entry = { column: string; direction: 'asc' | 'desc' };
    return {
        encode: (v) => JSON.stringify(v),
        decode: (raw) => {
            try {
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return [];
                const out: Entry[] = [];
                for (const entry of parsed) {
                    if (
                        entry &&
                        typeof entry === 'object' &&
                        typeof entry.column === 'string' &&
                        (entry.direction === 'asc' || entry.direction === 'desc')
                    ) {
                        out.push({ column: entry.column, direction: entry.direction });
                    }
                }
                return out;
            } catch {
                return [];
            }
        },
        isEqual: (a, b) => {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i].column !== b[i].column || a[i].direction !== b[i].direction) return false;
            }
            return true;
        }
    };
}
