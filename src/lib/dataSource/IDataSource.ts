import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import type { QueryResult } from './QueryResult.js';

export interface IDataSource<Data> {
    readonly queryResult: QueryResult<Data>;

    /**
     * Typed `<any>` rather than `<Data>` so that a concrete-typed source like
     * `LocalDataSource<UserRow>` is structurally assignable to the framework's
     * `IDataSource<unknown>` slot. Without this, contravariant uses of `Data`
     * inside `FullDataTableConfig<Data>` (e.g. `buildExportUrl`,
     * `dataUniquePropertyKey: keyof Data & string`) trip TypeScript's
     * variance check — the optional-method-syntax bivariance exemption
     * doesn't survive `Required<>` wrapping a generic. The lib itself only
     * needs `config.type`, so erasing `Data` here costs nothing at runtime.
     */
    setConfig?(config: FullDataTableConfig<any>): void;

    /**
     * Called to retrieve the initial dataTable entries and everytime the request changes, for example when
     * the user loads the next page, sorts the entries or searches for something
     * @param data the request data to be passed through to the server
     */
    requestData(data: PaginatedListRequest<Data>): void;

    /**
     * Optional one-shot fetch that does NOT mutate the visible `queryResult`.
     * Used by the export feature so triggering a chunked fetch doesn't blank
     * out the user's currently-rendered page. Implementations that can't
     * decouple may omit it; the export popover then disables local export
     * and falls back to remote-only.
     */
    fetchOnce?(request: PaginatedListRequest<Data>, signal?: AbortSignal): Promise<PaginatedListResponse<Data>>;

    /**
     * Called by the dataTable svelte component when it is mounted
     */
    onMount?(): void;

    /**
     * Hooks into SvelteKits {@link https://kit.svelte.dev/docs/modules#$app-navigation-afternavigate afterNavigate hook}
     */
    afterNavigate?(): void;
}
