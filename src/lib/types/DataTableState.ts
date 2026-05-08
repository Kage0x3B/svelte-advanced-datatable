import type { SortDirection } from '$lib/types/SortDirection.js';
import type { ReadableBox, WritableBox, WritableBoxedValues } from 'svelte-toolbelt';

export interface DataTableState {
    currentPage: number;
    searchInput: string;
    currentOpenIndex: number | undefined;
    sortColumnKey: string | undefined;
    sortDirection: SortDirection;

    /**
     * Reserved for future column-visibility feature (IMPROVEMENTS.md 1.2).
     * Map of column key → visible flag. Persistent tier when wired.
     */
    columnVisibility?: Record<string, boolean>;

    /**
     * Reserved for future column-resizing feature (IMPROVEMENTS.md 1.4).
     * Map of column key → width in pixels. Persistent tier when wired.
     */
    columnWidths?: Record<string, number>;

    /**
     * Reserved for future column-reordering feature (IMPROVEMENTS.md 1.3).
     * Ordered list of column keys. Persistent tier when wired.
     */
    columnOrder?: string[];

    /**
     * Reserved for future density-toggle feature (IMPROVEMENTS.md 1.14).
     * Persistent tier when wired.
     */
    density?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

type GetKeys<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
type RemoveValues<T, U> = Omit<T, GetKeys<T, U>>;
type BoxFlatten<R extends Record<string, unknown>> = Expand<
    RemoveValues<
        {
            [K in keyof R]: R[K] extends WritableBox<infer T> ? T : never;
        },
        never
    > &
        RemoveValues<
            {
                readonly [K in keyof R]: R[K] extends WritableBox<infer _>
                    ? never
                    : R[K] extends ReadableBox<infer T>
                      ? T
                      : never;
            },
            never
        >
> &
    RemoveValues<
        {
            [K in keyof R]: R[K] extends ReadableBox<infer _> ? never : R[K];
        },
        never
    >;

export type InternalDataTableState = BoxFlatten<WritableBoxedValues<DataTableState>>;
