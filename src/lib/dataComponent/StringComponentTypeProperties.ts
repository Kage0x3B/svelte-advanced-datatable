import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface StringComponentTypeProperties extends GenericComponentTypeProperties<string> {
    type: ComponentType.STRING;
}
