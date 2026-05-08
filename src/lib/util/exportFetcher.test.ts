import { describe, expect, it, vi } from 'vitest';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import { fetchAllRows } from './exportFetcher.js';

interface Row {
    id: number;
}

function makeFetcher(rows: Row[], chunkSize?: number) {
    const calls: PaginatedListRequest<Row>[] = [];
    const fetchOnce = (req: PaginatedListRequest<Row>): Promise<PaginatedListResponse<Row>> => {
        calls.push(req);
        const start = req.start ?? 0;
        const amount = req.amount ?? chunkSize ?? rows.length;
        return Promise.resolve({
            totalCount: rows.length,
            items: rows.slice(start, start + amount)
        });
    };
    return { fetchOnce, calls };
}

describe('fetchAllRows', () => {
    it('returns empty array for empty datasets', async () => {
        const { fetchOnce } = makeFetcher([]);
        const result = await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10 });
        expect(result).toEqual([]);
    });

    it('exits in one call when result fits in a single chunk', async () => {
        const rows = Array.from({ length: 5 }, (_, i) => ({ id: i }));
        const { fetchOnce, calls } = makeFetcher(rows);
        const result = await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10 });
        expect(result).toEqual(rows);
        expect(calls.length).toBe(1);
        expect(calls[0]).toMatchObject({ start: 0, amount: 10 });
    });

    it('iterates multiple chunks until the last short page', async () => {
        const rows = Array.from({ length: 25 }, (_, i) => ({ id: i }));
        const { fetchOnce, calls } = makeFetcher(rows);
        const result = await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10 });
        expect(result).toEqual(rows);
        expect(calls.length).toBe(3);
        expect(calls.map((c) => c.start)).toEqual([0, 10, 20]);
    });

    it('exits via empty-items guard when chunks line up exactly with totalCount', async () => {
        const rows = Array.from({ length: 20 }, (_, i) => ({ id: i }));
        const { fetchOnce, calls } = makeFetcher(rows);
        const result = await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10 });
        expect(result).toEqual(rows);
        // start=0 (10 rows) → start=10 (10 rows) → loop exits because items.length === chunkSize
        // and the next condition `start (20) < total (20)` is false.
        expect(calls.length).toBe(2);
    });

    it('reports progress on every chunk', async () => {
        const rows = Array.from({ length: 12 }, (_, i) => ({ id: i }));
        const { fetchOnce } = makeFetcher(rows);
        const onProgress = vi.fn();
        await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 5, onProgress });
        expect(onProgress).toHaveBeenCalledTimes(3);
        expect(onProgress.mock.calls.map((c) => c[0])).toEqual([5, 10, 12]);
        expect(onProgress.mock.calls.every((c) => c[1] === 12)).toBe(true);
    });

    it('throws AbortError when signal is aborted before the first call', async () => {
        const { fetchOnce, calls } = makeFetcher([{ id: 0 }]);
        const controller = new AbortController();
        controller.abort();
        await expect(
            fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10, signal: controller.signal })
        ).rejects.toMatchObject({ name: 'AbortError' });
        expect(calls.length).toBe(0);
    });

    it('throws AbortError when signal is aborted between chunks', async () => {
        const rows = Array.from({ length: 25 }, (_, i) => ({ id: i }));
        const controller = new AbortController();
        let calls = 0;
        const fetchOnce = (req: PaginatedListRequest<Row>): Promise<PaginatedListResponse<Row>> => {
            calls += 1;
            if (calls === 2) controller.abort();
            const start = req.start ?? 0;
            const amount = req.amount ?? 10;
            return Promise.resolve({ totalCount: rows.length, items: rows.slice(start, start + amount) });
        };
        await expect(
            fetchAllRows<Row>({
                fetchOnce,
                baseRequest: {},
                chunkSize: 10,
                signal: controller.signal
            })
        ).rejects.toMatchObject({ name: 'AbortError' });
    });

    it('handles totalCount: 0 with non-empty items defensively', async () => {
        // Pathological server response — should still terminate without an
        // infinite loop. Pushes the items it received and exits.
        const fetchOnce = vi.fn(() =>
            Promise.resolve<PaginatedListResponse<Row>>({ totalCount: 0, items: [{ id: 1 }] })
        );
        const result = await fetchAllRows<Row>({ fetchOnce, baseRequest: {}, chunkSize: 10 });
        expect(result).toEqual([{ id: 1 }]);
        expect(fetchOnce).toHaveBeenCalledTimes(1);
    });
});
