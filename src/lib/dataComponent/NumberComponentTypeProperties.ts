import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface NumberComponentTypeProperties extends GenericComponentTypeProperties<number> {
    type: ComponentType.NUMBER;
}
