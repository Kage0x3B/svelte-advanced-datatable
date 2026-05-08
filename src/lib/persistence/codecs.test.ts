import { describe, expect, it } from 'vitest';
import {
    jsonRecordCodec,
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

describe('jsonRecordCodec', () => {
    const codec = jsonRecordCodec<boolean>();

    it('round-trips a record', () => {
        const value = { a: true, b: false };
        const encoded = codec.encode(value);
        expect(codec.decode(encoded)).toEqual(value);
    });

    it('decodes invalid JSON to {}', () => {
        expect(codec.decode('not-json')).toEqual({});
    });

    it('decodes non-record JSON (array, primitive) to {}', () => {
        expect(codec.decode('[1,2,3]')).toEqual({});
        expect(codec.decode('"hello"')).toEqual({});
        expect(codec.decode('null')).toEqual({});
    });

    it('isEqual is true for records with same key/value pairs in any insertion order', () => {
        expect(codec.isEqual!({ a: true, b: false }, { b: false, a: true })).toBe(true);
    });

    it('isEqual is false for differing keys or values', () => {
        expect(codec.isEqual!({ a: true }, { a: true, b: false })).toBe(false);
        expect(codec.isEqual!({ a: true }, { a: false })).toBe(false);
    });

    it('isEqual treats two empty records as equal (default-elision)', () => {
        expect(codec.isEqual!({}, {})).toBe(true);
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
