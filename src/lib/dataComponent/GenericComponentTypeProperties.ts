import { ComponentType } from './ComponentType.js';

/**
 * @see {@link ComponentType.GENERIC}
 */
export interface GenericComponentTypeProperties<Type extends ComponentType, T> {
    /**
     * Type of this component/column
     */
    type: Type;

    /**
     * Define a custom formatter for the column values.
     */
    formatValue?: <Item extends Record<string, unknown>>(value: T, item: Item) => string;

    /**
     * Treat the returned string of formatValue as HTML and render it as such.
     */
    formatValueEnableHtml?: boolean;

    /**
     * If the values in this column can be sorted by clicking on the table header. Should usually be turned off for columns using a custom component.
     */
    sortable?: boolean;

    /**
     * Hides this table column. Permanent — the column is never shown and is
     * never offered in the column-visibility settings list. For user-toggleable
     * visibility, leave `hidden` falsy and let the persisted
     * `state.columnVisibility[key]` decide instead.
     */
    hidden?: boolean;

    /**
     * Marks the column as always visible: the user cannot hide it via the
     * settings popover, and it never appears in the visibility toggle list.
     * Useful for action columns or any "this column is essential" case.
     */
    alwaysVisible?: boolean;

    /**
     * Whether the user can drag the right edge of this column's header to
     * resize it. Defaults to `true`; set to `false` to lock the natural
     * width (e.g. for tight icon/action columns).
     */
    resizable?: boolean;
}
