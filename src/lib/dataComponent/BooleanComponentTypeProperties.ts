import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface BooleanComponentTypeProperties extends GenericComponentTypeProperties<boolean> {
    type: ComponentType.BOOLEAN;

    truthy: unknown;

    inverted: boolean;
}
