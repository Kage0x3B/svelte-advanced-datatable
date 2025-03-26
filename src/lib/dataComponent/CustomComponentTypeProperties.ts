import type { Component, Snippet } from 'svelte';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.CUSTOM}
 */
export interface CustomComponentTypeProperties<T = unknown>
    extends GenericComponentTypeProperties<ComponentType.CUSTOM, T> {
    /**
     * The svelte component class which renders this column.
     *
     * The component receives these props:
     * ```typescript
     * let { key, value, item, colProps }: CustomComponentProps<ColumnValueType, TableItemType> = $props();
     * ```
     *
     * @see {@link ComponentTypeProperties}
     */
    component?: Component<CustomComponentProps<T>>;

    /**
     * A svelte 5 snippet which renders this column.
     *
     * The snippet receives these props:
     * ```svelte
     * {#snippet customColumn({ key, value, item, colProps })}
     *     {value}
     * {/snippet}
     * ```
     */
    snippet?: CustomComponentSnippet<T>;
}

export interface CustomComponentProps<T = unknown, Data = unknown> {
    /**
     * Name of the column, a key of your data object, for example `firstName`
     */
    key: string;

    /**
     * Value of this column
     */
    value: T;

    /**
     * Full data for this row
     */
    item: Data;

    /**
     * Properties of this column
     */
    colProps: GenericComponentTypeProperties<ComponentType, T>;
}

export type CustomComponentSnippet<T = unknown, Data = unknown> = Snippet<[CustomComponentProps<T, Data>]>;

export type CustomSnippetProps = Record<`${string}Snippet`, CustomComponentSnippet>;
