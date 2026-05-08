import { describe, expect, it } from 'vitest';
import {
    numberCodec,
    optionalNumberCodec,
    optionalStringCodec,
    sortDirectionCodec,
    stringCodec
} from './codecs.js';

describe('numberCodec', () => {
    it('round-trips integers', () => {
        expect(numberCodec.decode(numberCodec.encode(42))).toBe(42);
        expect(numberCodec.decode(numberCodec.encode(0))).toBe(0);
        expect(numberCodec.decode(numberCodec.encode(-5))).toBe(-5);
    });

    it('decodes garbage to 0', () => {
        expect(numberCodec.decode('not-a-number')).toBe(0);
    });
});

describe('stringCodec', () => {
    it('round-trips arbitrary strings', () => {
        expect(stringCodec.decode(stringCodec.encode('hello world'))).toBe('hello world');
        expect(stringCodec.decode(stringCodec.encode(''))).toBe('');
        expect(stringCodec.decode(stringCodec.encode('a:b/c?d=e'))).toBe('a:b/c?d=e');
    });
});

describe('optionalStringCodec', () => {
    it('round-trips non-empty strings', () => {
        expect(optionalStringCodec.decode(optionalStringCodec.encode('foo'))).toBe('foo');
    });

    it('treats empty string as undefined on decode', () => {
        expect(optionalStringCodec.decode('')).toBeUndefined();
    });

    it('encodes undefined as empty string', () => {
        expect(optionalStringCodec.encode(undefined)).toBe('');
    });
});

describe('optionalNumberCodec', () => {
    it('round-trips numbers', () => {
        expect(optionalNumberCodec.decode(optionalNumberCodec.encode(7))).toBe(7);
        expect(optionalNumberCodec.decode(optionalNumberCodec.encode(0))).toBe(0);
    });

    it('round-trips undefined', () => {
        expect(optionalNumberCodec.decode(optionalNumberCodec.encode(undefined))).toBeUndefined();
    });

    it('decodes garbage to undefined', () => {
        expect(optionalNumberCodec.decode('xyz')).toBeUndefined();
    });
});

describe('sortDirectionCodec', () => {
    it('round-trips asc and desc', () => {
        expect(sortDirectionCodec.decode(sortDirectionCodec.encode('asc'))).toBe('asc');
        expect(sortDirectionCodec.decode(sortDirectionCodec.encode('desc'))).toBe('desc');
    });

    it('encodes false (no-sort) as empty string', () => {
        expect(sortDirectionCodec.encode(false)).toBe('');
    });

    it('decodes empty / unknown to false', () => {
        expect(sortDirectionCodec.decode('')).toBe(false);
        expect(sortDirectionCodec.decode('sideways')).toBe(false);
    });
});
