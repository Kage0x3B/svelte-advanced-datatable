import { describe, expect, it, vi } from 'vitest';
import { MemoryStateStore } from './MemoryStateStore.svelte.js';
import { jsonRecordCodec, numberCodec, stringCodec } from './codecs.js';

describe('MemoryStateStore', () => {
    it('returns the fallback when nothing has been written', () => {
        const store = new MemoryStateStore();
        expect(store.get('page', 1, numberCodec)).toBe(1);
    });

    it('round-trips a stored value during the component lifetime', () => {
        const store = new MemoryStateStore();
        store.set('page', 3, 1, numberCodec);
        expect(store.get('page', 1, numberCodec)).toBe(3);
    });

    it('default-elision: writing the fallback drops the key', () => {
        const store = new MemoryStateStore();
        store.set('q', 'foo', '', stringCodec);
        expect(store.get('q', '', stringCodec)).toBe('foo');
        store.set('q', '', '', stringCodec);
        expect(store.get('q', '', stringCodec)).toBe('');
    });

    it('first write of an object-codec value does not crash on the freshness check', () => {
        // Regression: the change-detection compared `record[key]` (undefined
        // on a fresh slot) to the new value via the codec's isEqual. The
        // jsonRecordCodec's isEqual called Object.keys(undefined) and threw.
        const store = new MemoryStateStore();
        const codec = jsonRecordCodec<number>();
        expect(() => store.set('columnWidths', { userName: 0.5 }, {}, codec)).not.toThrow();
        expect(store.get('columnWidths', {}, codec)).toEqual({ userName: 0.5 });
    });

    it('subscribe fires only when the value actually changes', () => {
        const store = new MemoryStateStore();
        const cb = vi.fn();
        store.subscribe(cb);
        store.set('page', 2, 1, numberCodec);
        expect(cb).toHaveBeenCalledTimes(1);
        store.set('page', 2, 1, numberCodec);
        expect(cb).toHaveBeenCalledTimes(1);
        store.set('page', 1, 1, numberCodec); // back to fallback → delete
        expect(cb).toHaveBeenCalledTimes(2);
    });
});
