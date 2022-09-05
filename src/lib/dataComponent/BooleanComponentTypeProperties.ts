import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.BOOLEAN}
 */
export interface BooleanComponentTypeProperties extends GenericComponentTypeProperties<boolean> {
    type: ComponentType.BOOLEAN;

    /**
     * The columns value is loosely checked against this value to determine if it's `true` or `false`.
     *
     * Defaults to `true` but can be changed to for example a string, if your system uses an unusual value for true like the string `"active"`
     */
    truthy: unknown;

    /**
     * Inverts the shown boolean value
     */
    inverted: boolean;
}
