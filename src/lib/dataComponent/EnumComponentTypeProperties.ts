import type { ComponentType, TextColor } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface EnumComponentTypeProperties<Enum extends string> extends GenericComponentTypeProperties<string> {
    type: ComponentType.ENUM;

    values: Enum[];

    enumColorKey: Partial<{
        [key in Enum]: TextColor;
    } & {
        default: TextColor;
        unknown: TextColor;
    }>;
}
