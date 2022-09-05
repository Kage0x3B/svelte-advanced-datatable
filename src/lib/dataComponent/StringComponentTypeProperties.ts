import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.STRING}
 */
export interface StringComponentTypeProperties extends GenericComponentTypeProperties<string> {
	type: ComponentType.STRING;
}
