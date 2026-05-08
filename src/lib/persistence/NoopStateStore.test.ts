import { describe, expect, it } from 'vitest';
import { NoopStateStore } from './NoopStateStore.js';
import { numberCodec, stringCodec } from './codecs.js';

describe('NoopStateStore', () => {
    it('always returns the fallback', () => {
        const store = new NoopStateStore();
        expect(store.get('page', 1, numberCodec)).toBe(1);
        expect(store.get('q', 'default', stringCodec)).toBe('default');
    });

    it('set never throws and never affects subsequent gets', () => {
        const store = new NoopStateStore();
        expect(() => store.set('page', 5, 1, numberCodec)).not.toThrow();
        expect(store.get('page', 1, numberCodec)).toBe(1);
    });
});
