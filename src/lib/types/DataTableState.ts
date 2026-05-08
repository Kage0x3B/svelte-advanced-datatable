import type { SortDirection } from '$lib/types/SortDirection.js';

export interface DataTableState {
    currentPage: number;
    searchInput: string;
    currentOpenIndex: number | undefined;
    sortColumnKey: string | undefined;
    sortDirection: SortDirection;

    /**
     * Secondary sort criteria applied after the primary sort
     * (`sortColumnKey` / `sortDirection`). Populated by Shift-clicking column
     * headers — each entry adds another tiebreaker. Empty / absent means
     * single-column sorting. Transient tier.
     */
    additionalSort?: Array<{ column: string; direction: 'asc' | 'desc' }>;

    /**
     * User-chosen items-per-page override. When `undefined`, falls back to
     * `config.itemsPerPage`. Persistent tier.
     */
    itemsPerPage?: number;

    /**
     * Map of column key → visible flag. When a key is absent or `true`, the
     * column is shown. When `false`, the user has hidden it via the settings
     * popover. Independent from the static `colProp.hidden` config flag,
     * which is a permanent "never shown" override. Persistent tier.
     */
    columnVisibility?: Record<string, boolean>;

    /**
     * Map of column key → width as a fraction of the table's clientWidth at
     * the moment of resize (0–1, e.g. `0.4` ≈ 40 %). Stored as a fraction so
     * the layout scales with window/table resizes — a column dragged to half
     * the table stays half-width on a phone or a 4K monitor. Absent keys use
     * the column's natural width. Persistent tier.
     */
    columnWidths?: Record<string, number>;

    /**
     * User-chosen column order. When present, columns render in this order
     * instead of the `config.columnProperties` definition order. Keys missing
     * from the array fall back to their config-order position (so adding a
     * new column to the config after a reorder doesn't drop it). Persistent
     * tier.
     */
    columnOrder?: string[];

    /**
     * User-chosen table density override. When `undefined`, falls back to
     * the `size` prop on `DaisyUiDataTable`. Maps directly to DaisyUI's
     * `table-{xs,sm,md,lg,xl}` modifiers. Persistent tier.
     */
    density?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Runtime state shape used inside the table component, after all persistence
 * boxes have been flattened. Every field is always populated — optional
 * `DataTableState` fields use sensible defaults (e.g. `itemsPerPage` falls
 * back to `config.itemsPerPage`, record fields fall back to `{}`).
 */
export interface InternalDataTableState {
    currentPage: number;
    searchInput: string;
    currentOpenIndex: number | undefined;
    sortColumnKey: string | undefined;
    sortDirection: SortDirection;
    itemsPerPage: number;
    columnVisibility: Record<string, boolean>;
    columnWidths: Record<string, number>;
    columnOrder: string[];
    /**
     * `undefined` means "follow the component's `size` prop" — the table
     * renders with no explicit density override.
     */
    density: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
    additionalSort: Array<{ column: string; direction: 'asc' | 'desc' }>;
}
