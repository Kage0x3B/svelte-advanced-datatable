import type { SortDirection } from '$lib/types/SortDirection.js';
import type { ReadableBox, WritableBox, WritableBoxedValues } from 'svelte-toolbelt';

export interface DataTableState {
    currentPage: number;
    searchInput: string;
    currentOpenIndex: number | undefined;
    sortColumnKey: string | undefined;
    sortDirection: SortDirection;
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
