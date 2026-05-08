import { describe, expect, it, vi } from 'vitest';
import { SnapshotStateStore } from './SnapshotStateStore.svelte.js';
import { jsonRecordCodec, numberCodec, stringCodec } from './codecs.js';

describe('SnapshotStateStore', () => {
    it('returns fallback when key is unset', () => {
        const store = new SnapshotStateStore();
        expect(store.get('page', 1, numberCodec)).toBe(1);
    });

    it('round-trips a stored value', () => {
        const store = new SnapshotStateStore();
        store.set('page', 3, 1, numberCodec);
        expect(store.get('page', 1, numberCodec)).toBe(3);
    });

    it('default-elision: writing the fallback removes the key', () => {
        const store = new SnapshotStateStore();
        store.set('page', 5, 1, numberCodec);
        expect(store.snapshot()).toEqual({ page: 5 });
        store.set('page', 1, 1, numberCodec);
        expect(store.snapshot()).toEqual({});
    });

    it('snapshot() returns a shallow copy', () => {
        const store = new SnapshotStateStore();
        store.set('q', 'hi', '', stringCodec);
        const snap = store.snapshot();
        snap.q = 'mutated';
        expect(store.get('q', '', stringCodec)).toBe('hi');
    });

    it('hydrate() replaces the backing record', () => {
        const store = new SnapshotStateStore();
        store.set('page', 5, 1, numberCodec);
        store.hydrate({ q: 'foo' });
        expect(store.get('page', 1, numberCodec)).toBe(1);
        expect(store.get('q', '', stringCodec)).toBe('foo');
    });

    it('first write of an object-codec value does not crash on the freshness check', () => {
        const store = new SnapshotStateStore();
        const codec = jsonRecordCodec<boolean>();
        expect(() => store.set('columnVisibility', { id: false }, {}, codec)).not.toThrow();
        expect(store.get('columnVisibility', {}, codec)).toEqual({ id: false });
    });

    it('subscribe fires on set and hydrate', () => {
        const store = new SnapshotStateStore();
        const cb = vi.fn();
        const unsubscribe = store.subscribe(cb);
        store.set('page', 2, 1, numberCodec);
        expect(cb).toHaveBeenCalledTimes(1);
        store.hydrate({ q: 'a' });
        expect(cb).toHaveBeenCalledTimes(2);
        unsubscribe();
        store.set('page', 3, 1, numberCodec);
        expect(cb).toHaveBeenCalledTimes(2);
    });
});
