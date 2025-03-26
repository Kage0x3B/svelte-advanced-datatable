import type { ComponentType } from './ComponentType.js';

/**
 * @see {@link ComponentType.GENERIC}
 */
export interface GenericComponentTypeProperties<Type extends ComponentType, T> {
    /**
     * Type of this component/column
     */
    type: Type;

    /**
     * If the values in this column can be sorted by clicking on the table header. Should usually be turned off for columns using a custom component.
     */
    sortable?: boolean;

    /**
     * Hides this table column
     */
    hidden?: boolean;
}
