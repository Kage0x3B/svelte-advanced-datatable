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
