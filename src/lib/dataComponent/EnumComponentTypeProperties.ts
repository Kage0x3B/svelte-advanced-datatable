import type { WrappedComponentColor } from '../types/WrappedComponentProperty.js';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface EnumComponentTypeProperties<Enum extends string> extends GenericComponentTypeProperties<string> {
    type: ComponentType.ENUM;

    values: Enum[];

    enumColorKey: Partial<{
        [key in Enum]: WrappedComponentColor | string;
    } & {
        default: WrappedComponentColor | string;
        unknown: WrappedComponentColor | string;
    }>;
}
