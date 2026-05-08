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
