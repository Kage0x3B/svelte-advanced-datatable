import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './generalUtil.js';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('only fires once when called repeatedly within the wait window', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 200);

        debounced('a');
        debounced('b');
        debounced('c');

        vi.advanceTimersByTime(199);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('c');
    });

    it('fires again after the wait window has passed', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 200);

        debounced('first');
        vi.advanceTimersByTime(200);

        debounced('second');
        vi.advanceTimersByTime(200);

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenNthCalledWith(1, 'first');
        expect(fn).toHaveBeenNthCalledWith(2, 'second');
    });

    it('cancel() prevents a pending invocation from firing', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 200);

        debounced('payload');
        debounced.cancel();

        vi.advanceTimersByTime(500);
        expect(fn).not.toHaveBeenCalled();
    });

    it('cancel() is safe to call when no invocation is pending', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 200);

        expect(() => debounced.cancel()).not.toThrow();
        expect(() => debounced.cancel()).not.toThrow();
        expect(fn).not.toHaveBeenCalled();
    });

    it('cancel() does not block subsequent invocations from being scheduled', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 200);

        debounced('first');
        debounced.cancel();

        debounced('second');
        vi.advanceTimersByTime(200);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('second');
    });
});
