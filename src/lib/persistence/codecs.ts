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
