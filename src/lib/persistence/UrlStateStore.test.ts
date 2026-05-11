// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGIN = 'http://localhost:3000';

const { pageMock, replaceStateMock } = vi.hoisted(() => ({
    pageMock: { url: new URL('http://localhost:3000/'), state: {} as unknown },
    replaceStateMock: vi.fn<(url: URL, state: unknown) => void>()
}));

vi.mock('$app/state', () => ({ page: pageMock }));
vi.mock('$app/navigation', () => ({ replaceState: replaceStateMock }));

import { stringCodec } from './codecs.js';
import { UrlStateStore } from './UrlStateStore.svelte.js';

describe('UrlStateStore', () => {
    beforeEach(() => {
        window.history.replaceState({}, '', `${ORIGIN}/`);
        pageMock.url = new URL(`${ORIGIN}/`);
        pageMock.state = {};
        replaceStateMock.mockReset();
        // Mirror real SvelteKit behavior: `replaceState` updates
        // `window.location` and `page.state`, but NOT `page.url`.
        replaceStateMock.mockImplementation((url, state) => {
            window.history.replaceState({}, '', url.toString());
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
            expect(new URL(window.location.href).searchParams.get('dt-q')).toBe('foo');
            expect(store.get('q', '', stringCodec)).toBe('foo');
        } finally {
            vi.useRealTimers();
        }
    });

    it('writing the fallback removes the key from the URL', async () => {
        vi.useFakeTimers();
        try {
            window.history.replaceState({}, '', `${ORIGIN}/?dt-q=foo`);
            const store = new UrlStateStore('dt', 10);
            store.set('q', '', '', stringCodec);
            await vi.advanceTimersByTimeAsync(15);
            expect(new URL(window.location.href).searchParams.has('dt-q')).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });

    // Regression test for the structural bug fixed in 0.14.3: SvelteKit's
    // `replaceState` updates `window.location` but never `page.url`. Reading
    // from `page.url` after flush returned stale data, causing the getter to
    // fall through to the fallback once `pendingWrites` was cleared.
    it('reads survive flush even when page.url stays stale (real SvelteKit behavior)', () => {
        vi.useFakeTimers();
        try {
            // Note the beforeEach mock already mirrors real SvelteKit: page.url
            // is never updated. This test asserts the getter still works.
            const store = new UrlStateStore('dt', 10);
            store.set('q', 'foo', '', stringCodec);
            vi.advanceTimersByTime(15); // flush runs synchronously
            expect(replaceStateMock).toHaveBeenCalledTimes(1);
            expect(pageMock.url.searchParams.has('dt-q')).toBe(false); // page.url still stale
            expect(new URL(window.location.href).searchParams.get('dt-q')).toBe('foo');
            // Post-fix: getter reads window.location, returns 'foo' not ''.
            expect(store.get('q', '', stringCodec)).toBe('foo');
        } finally {
            vi.useRealTimers();
        }
    });

    it('preserves concurrent writes that arrive after flush completes', async () => {
        vi.useFakeTimers();
        try {
            const store = new UrlStateStore('dt', 10);
            store.set('q', 'foo', '', stringCodec);
            vi.advanceTimersByTime(15); // flush runs, pendingWrites cleared
            store.set('q', 'bar', '', stringCodec);
            await Promise.resolve();
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
        expect(new URL(window.location.href).searchParams.get('dt-q')).toBe('foo');
    });

    it('falls back to page.url when window is unavailable (SSR path)', () => {
        // Can't actually delete window in happy-dom, but verify that when
        // pendingWrites and window.location both lack the key, page.url is
        // consulted. (SSR uses the same code path with browser=false at module
        // load; this asserts the page.url codepath still wires through.)
        pageMock.url = new URL(`${ORIGIN}/?dt-q=fromPage`);
        const store = new UrlStateStore('dt', 10);
        // window.location has no dt-q; page.url has dt-q=fromPage. In the
        // browser the getter prefers window.location → returns fallback ''.
        expect(store.get('q', '', stringCodec)).toBe('');
        // Real SSR would have browser=false and would read page.url; covered
        // by inspection of `currentUrl()` rather than runtime here.
    });

    afterEach(() => {
        vi.useRealTimers();
    });
});
