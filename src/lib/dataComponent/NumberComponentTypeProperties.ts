import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.NUMBER}
 */
export interface NumberComponentTypeProperties extends GenericComponentTypeProperties<number> {
    type: ComponentType.NUMBER;
}
