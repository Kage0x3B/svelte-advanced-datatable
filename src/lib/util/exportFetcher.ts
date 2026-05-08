import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';

export interface FetchAllRowsParams<Data> {
    /**
     * Non-stateful fetch (e.g. `IDataSource.fetchOnce`). Must not mutate the
     * data source's visible `queryResult`.
     */
    fetchOnce: (request: PaginatedListRequest<Data>, signal?: AbortSignal) => Promise<PaginatedListResponse<Data>>;

    /**
     * Sort/search/filter context to inherit. The fetcher fills in `start` and
     * `amount` per chunk.
     */
    baseRequest: Omit<PaginatedListRequest<Data>, 'start' | 'amount'>;

    /** Rows requested per chunk. */
    chunkSize: number;

    /**
     * Cancel signal. Checked between chunks; sub-chunk cancellation requires
     * the consumer's `apiFunction` to honour the signal.
     */
    signal?: AbortSignal;

    /**
     * Called after every chunk. `total` may grow or shrink between calls
     * (rows added/removed mid-export); treat the result as a best-effort
     * snapshot.
     */
    onProgress?: (loaded: number, total: number) => void;
}

/**
 * Page through every matching row by repeatedly calling the supplied
 * `fetchOnce`. Stops when `start >= total`, when a chunk returns fewer
 * rows than requested, or when the chunk is empty (server truncated).
 */
export async function fetchAllRows<Data>(params: FetchAllRowsParams<Data>): Promise<Data[]> {
    const { fetchOnce, baseRequest, chunkSize, signal, onProgress } = params;
    const out: Data[] = [];
    let start = 0;
    let total = Number.POSITIVE_INFINITY;

    while (start < total) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        const res = await fetchOnce({ ...baseRequest, start, amount: chunkSize }, signal);
        out.push(...res.items);
        total = res.totalCount;

        onProgress?.(out.length, total);

        if (res.items.length === 0) break;
        if (res.items.length < chunkSize) break;

        start += chunkSize;
    }

    return out;
}
