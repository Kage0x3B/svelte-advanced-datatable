// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebStorageStateStore } from './WebStorageStateStore.svelte.js';
import { numberCodec, stringCodec } from './codecs.js';

describe('WebStorageStateStore', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    it('round-trips a value through localStorage with the namespace prefix', () => {
        const store = new WebStorageStateStore('localStorage', 'users');
        store.set('page', 3, 1, numberCodec);
        expect(window.localStorage.getItem('users-page')).toBe('3');
        expect(store.get('page', 1, numberCodec)).toBe(3);
        store.destroy();
    });

    it('default-elision: writing the fallback removes the key', () => {
        const store = new WebStorageStateStore('localStorage', 'users');
        store.set('page', 5, 1, numberCodec);
        expect(window.localStorage.getItem('users-page')).toBe('5');
        store.set('page', 1, 1, numberCodec);
        expect(window.localStorage.getItem('users-page')).toBeNull();
        store.destroy();
    });

    it('returns fallback when the stored value is missing', () => {
        const store = new WebStorageStateStore('localStorage', 'users');
        expect(store.get('q', 'default', stringCodec)).toBe('default');
        store.destroy();
    });

    it('uses sessionStorage when configured', () => {
        const store = new WebStorageStateStore('sessionStorage', 'tab');
        store.set('q', 'hello', '', stringCodec);
        expect(window.sessionStorage.getItem('tab-q')).toBe('hello');
        expect(window.localStorage.getItem('tab-q')).toBeNull();
        store.destroy();
    });

    it('subscribe fires on cross-tab storage events for matching namespace', () => {
        const store = new WebStorageStateStore('localStorage', 'users');
        const cb = vi.fn();
        const unsubscribe = store.subscribe(cb);

        const evt = new StorageEvent('storage', {
            key: 'users-page',
            newValue: '2',
            storageArea: window.localStorage
        });
        window.dispatchEvent(evt);
        expect(cb).toHaveBeenCalledTimes(1);

        unsubscribe();
        window.dispatchEvent(evt);
        expect(cb).toHaveBeenCalledTimes(1);
        store.destroy();
    });

    it('subscribe ignores storage events from a different namespace', () => {
        const store = new WebStorageStateStore('localStorage', 'users');
        const cb = vi.fn();
        store.subscribe(cb);

        const evt = new StorageEvent('storage', {
            key: 'unrelated-page',
            newValue: '2',
            storageArea: window.localStorage
        });
        window.dispatchEvent(evt);
        expect(cb).not.toHaveBeenCalled();
        store.destroy();
    });
});
