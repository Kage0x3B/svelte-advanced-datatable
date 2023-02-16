import type { DateTime } from 'luxon';
import type { BooleanComponentTypeProperties } from './BooleanComponentTypeProperties.js';
import type { CustomComponentTypeProperties } from './CustomComponentTypeProperties.js';
import type { DateComponentTypeProperties } from './DateComponentTypeProperties.js';
import type { EnumComponentTypeProperties } from './EnumComponentTypeProperties.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';
import type { NumberComponentTypeProperties } from './NumberComponentTypeProperties.js';
import type { StringComponentTypeProperties } from './StringComponentTypeProperties.js';

/**
 * Enum for all inbuilt component types.
 * @see {@link ComponentType.CUSTOM} to create table columns with a custom svelte component
 */
export enum ComponentType {
	/**
	 * Internal component type used when generating the component properties for default values
	 *
	 * @see {@link GenericComponentTypeProperties}
	 */
	GENERIC = 'generic',
	/**
	 * General number type
	 *
	 * @see {@link NumberComponentTypeProperties}
	 */
	NUMBER = 'number',
	/**
	 * General string type
	 *
	 * @see {@link StringComponentTypeProperties}
	 */
	STRING = 'string',
	/**
	 * General boolean type with support for unusual boolean-like values, for example string values representing a boolean
	 *
	 * @see {@link BooleanComponentTypeProperties}
	 */
	BOOLEAN = 'boolean',
	/**
	 * Enum type to display enum values fancier, translate them and have default/unknown value names.
	 *
	 * @see {@link EnumComponentTypeProperties}
	 */
	ENUM = 'enum',
	/**
	 * Date type supporting the normal JavaScript Date as well as {@link https://moment.github.io/luxon luxon DateTime}
	 *
	 * @see {@link DateComponentTypeProperties}
	 */
	DATE = 'date',
	/**
	 * Custom type to render a table column with a custom svelte component
	 *
	 * @see {@link CustomComponentTypeProperties}
	 */
	CUSTOM = 'custom'
}

export type ComponentTypeProperties = RequiredTypeProperty<
	| BooleanComponentTypeProperties
	| NumberComponentTypeProperties
	| StringComponentTypeProperties
	| EnumComponentTypeProperties<string>
	| CustomComponentTypeProperties
	| DateComponentTypeProperties
>;

/**
 * Config for a component type.
 * * {@link ComponentTypeConfig.defaultValue} is the default value the data of a column with this type will be set to when undefined
 * * {@link ComponentTypeConfig.defaultTypeProperties} are defaults for the type to make some properties optional
 * * {@link ComponentTypeConfig.forcedTypeProperties} are properties for this type, which can't be overridden by the user.
 * Used for example when a component type is not possible to be searched
 */
export type ComponentTypeConfig<T, TP extends GenericComponentTypeProperties<T>> = {
	defaultValue?: T;
	defaultTypeProperties?: Partial<TP>;
	forcedTypeProperties?: Partial<TP>;
};

export type RequiredTypeProperty<T extends { type: ComponentType }> = Required<Pick<T, 'type'>> & Partial<T>;

export type TableColumnConfig<Data> = Record<keyof Data, ComponentTypeProperties>;

/**
 * Config for all inbuilt component types, containing the default value the type has, as well as default and forced type properties
 */
export const componentTypes: Record<
	ComponentType,
	ComponentTypeConfig<unknown, GenericComponentTypeProperties<unknown>>
> = {
	generic: {
		defaultTypeProperties: {
			type: ComponentType.STRING,
			sortable: true,
			hidden: false
		}
	} as ComponentTypeConfig<unknown, GenericComponentTypeProperties<unknown>>,
	boolean: {
		defaultValue: false,
		defaultTypeProperties: {
			truthy: true,
			inverted: false
		}
	} as ComponentTypeConfig<boolean, BooleanComponentTypeProperties>,
	string: {
		defaultValue: ''
	} as ComponentTypeConfig<string, StringComponentTypeProperties>,
	number: {
		defaultValue: 0
	} as ComponentTypeConfig<number, NumberComponentTypeProperties>,
	enum: {
		defaultValue: '',
		defaultTypeProperties: {
			enumColorKey: {
				default: 'dark',
				unknown: 'secondary'
			}
		}
	} as ComponentTypeConfig<string, EnumComponentTypeProperties<string>>,
	custom: {
		defaultTypeProperties: {
			sort: false
		}
	} as ComponentTypeConfig<unknown, CustomComponentTypeProperties>,
	date: {
		defaultTypeProperties: {
			dateRelative: false,
			// Equivalent to luxons DATETIME_MED
			dateFormat: {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric'
			}
		}
	} as ComponentTypeConfig<DateTime, DateComponentTypeProperties>
};
