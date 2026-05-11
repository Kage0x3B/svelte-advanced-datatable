// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { pageMock, replaceStateMock } = vi.hoisted(() => ({
    pageMock: { url: new URL('http://localhost/'), state: {} as unknown },
    replaceStateMock: vi.fn<(url: URL, state: unknown) => void>()
}));

vi.mock('$app/state', () => ({ page: pageMock }));
vi.mock('$app/navigation', () => ({ replaceState: replaceStateMock }));

import { stringCodec } from './codecs.js';
import { UrlStateStore } from './UrlStateStore.svelte.js';

describe('UrlStateStore', () => {
    beforeEach(() => {
        pageMock.url = new URL('http://localhost/');
        pageMock.state = {};
        replaceStateMock.mockReset();
        // Default: SvelteKit updates page.url synchronously on replaceState.
        replaceStateMock.mockImplementation((url, state) => {
            pageMock.url = url;
            pageMock.state = state;
        });
    });

    it('reads pending writes before flush', () => {
        const store = new UrlStateStore('dt', 10);
        store.set('q', 'foo', '', stringCodec);
        expect(store.get('q', '', stringCodec)).toBe('foo');
    });

    it('flushes pending writes to the URL after debounce', async () => {
        vi.useFakeTimers();
        try {
            const store = new UrlStateStore('dt', 10);
            store.set('q', 'foo', '', stringCodec);
            expect(replaceStateMock).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(15);
            expect(replaceStateMock).toHaveBeenCalledTimes(1);
            expect(pageMock.url.searchParams.get('dt-q')).toBe('foo');
            expect(store.get('q', '', stringCodec)).toBe('foo');
        } finally {
            vi.useRealTimers();
        }
    });

    it('writing the fallback removes the key from the URL', async () => {
        vi.useFakeTimers();
        try {
            pageMock.url = new URL('http://localhost/?dt-q=foo');
            const store = new UrlStateStore('dt', 10);
            store.set('q', '', '', stringCodec);
            await vi.advanceTimersByTimeAsync(15);
            expect(pageMock.url.searchParams.has('dt-q')).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });

    // Regression test for the flush() race: clearing `pendingWrites` synchronously
    // (the pre-fix behavior) left a window where readers saw empty pendingWrites
    // plus a stale `page.url`, falling through to the fallback. The fix defers
    // the clear to a microtask so reads in the same synchronous frame as flush
    // still see the just-applied value.
    it('keeps reads consistent in the synchronous frame after flush runs', () => {
        vi.useFakeTimers();
        try {
            // Simulate page.url propagating later than the synchronous flush frame.
            replaceStateMock.mockImplementation((url, state) => {
                queueMicrotask(() => {
                    pageMock.url = url;
                    pageMock.state = state;
                });
            });
            const store = new UrlStateStore('dt', 10);
            store.set('q', 'foo', '', stringCodec);
            // Advance the debounce timer synchronously; flush() runs but the
            // microtask that updates page.url (and the one that clears pendingWrites)
            // is still pending.
            vi.advanceTimersByTime(15);
            expect(replaceStateMock).toHaveBeenCalledTimes(1);
            expect(pageMock.url.searchParams.has('dt-q')).toBe(false);
            // Pre-fix: pendingWrites = {} synchronously, page.url stale → returns ''.
            // Post-fix: pendingWrites still populated → returns 'foo'.
            expect(store.get('q', '', stringCodec)).toBe('foo');
        } finally {
            vi.useRealTimers();
        }
    });

    it('preserves writes that arrive between flush and the deferred clear', async () => {
        vi.useFakeTimers();
        try {
            const store = new UrlStateStore('dt', 10);
            store.set('q', 'foo', '', stringCodec);
            vi.advanceTimersByTime(15); // flush() runs, clear is queued as a microtask
            // Concurrent write before the microtask drains.
            store.set('q', 'bar', '', stringCodec);
            await Promise.resolve(); // drain microtask queue
            // The deferred clear must not have clobbered 'bar'.
            expect(store.get('q', '', stringCodec)).toBe('bar');
        } finally {
            vi.useRealTimers();
        }
    });

    it('destroy() flushes pending writes', () => {
        const store = new UrlStateStore('dt', 10);
        store.set('q', 'foo', '', stringCodec);
        store.destroy();
        expect(replaceStateMock).toHaveBeenCalledTimes(1);
        expect(pageMock.url.searchParams.get('dt-q')).toBe('foo');
    });

    afterEach(() => {
        vi.useRealTimers();
    });
});
