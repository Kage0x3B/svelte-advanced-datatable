import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchApiDataSource } from './FetchApiDataSource.svelte.js';

interface Row {
    id: number;
    name: string;
}

const baseRequest = {
    start: 0,
    amount: 10
};

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('FetchApiDataSource', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('passes an AbortSignal to fetch', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalCount: 0, items: [] })
        });

        const source = new FetchApiDataSource<Row>('/api/rows');
        source.requestData(baseRequest);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const init = fetchMock.mock.calls[0][1] as RequestInit;
        expect(init.signal).toBeInstanceOf(AbortSignal);
        expect(init.signal!.aborted).toBe(false);
    });

    it('aborts the previous in-flight request when a new one is sent', async () => {
        fetchMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({ totalCount: 0, items: [] })
                            }),
                        50
                    );
                })
        );

        const source = new FetchApiDataSource<Row>('/api/rows');
        source.requestData(baseRequest);
        const firstSignal = (fetchMock.mock.calls[0][1] as RequestInit).signal!;

        source.requestData({ ...baseRequest, start: 10 });
        const secondSignal = (fetchMock.mock.calls[1][1] as RequestInit).signal!;

        expect(firstSignal.aborted).toBe(true);
        expect(secondSignal.aborted).toBe(false);
    });

    it('does not surface an error for an aborted request', async () => {
        const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
        let rejectFirst: (reason: unknown) => void = () => {};
        fetchMock.mockImplementationOnce(
            () =>
                new Promise((_resolve, reject) => {
                    rejectFirst = reject;
                })
        );
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalCount: 1, items: [{ id: 1, name: 'A' }] })
        });

        const source = new FetchApiDataSource<Row>('/api/rows');
        source.requestData(baseRequest);
        source.requestData({ ...baseRequest, start: 10 });

        // Simulate the aborted promise rejecting after the new request has started
        rejectFirst(abortError);
        await flushMicrotasks();
        await flushMicrotasks();

        expect(source.queryResult.isError()).toBe(false);
    });

    it('reports a fetch failure as an error', async () => {
        fetchMock.mockRejectedValueOnce(new Error('network down'));

        const source = new FetchApiDataSource<Row>('/api/rows');
        source.requestData(baseRequest);

        await flushMicrotasks();

        expect(source.queryResult.isError()).toBe(true);
        expect(source.queryResult.error?.message).toBe('network down');
    });

    it('reports success when fetch returns ok', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalCount: 1, items: [{ id: 1, name: 'A' }] })
        });

        const source = new FetchApiDataSource<Row>('/api/rows');
        source.requestData(baseRequest);

        await flushMicrotasks();
        await flushMicrotasks();

        expect(source.queryResult.isSuccess()).toBe(true);
        expect(source.queryResult.data).toEqual({
            totalCount: 1,
            items: [{ id: 1, name: 'A' }]
        });
    });
});
