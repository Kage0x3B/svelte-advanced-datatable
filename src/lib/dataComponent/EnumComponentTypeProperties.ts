import type { WrappedComponentColor } from './WrappedComponentProperty.js';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.ENUM}
 */
export interface EnumComponentTypeProperties<Enum extends string> extends GenericComponentTypeProperties<string> {
    type: ComponentType.ENUM;

    /**
     * An array listing all possible values of this enum
     */
    values: Enum[];

    /**
     * Map each enum value to a color
     */
    enumColorKey: Partial<
        {
            [key in Enum]: WrappedComponentColor | string;
        } & {
            default: WrappedComponentColor | string;
            unknown: WrappedComponentColor | string;
        }
    >;
}
