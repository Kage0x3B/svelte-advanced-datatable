import type { ComponentTypeProperties, TableColumnConfig } from '../dataComponent/ComponentType.js';
import { componentTypes } from '../dataComponent/ComponentType.js';

export function buildColumnPropertyData<Data>(
	columnProperties: TableColumnConfig<Data>
): Record<string, ComponentTypeProperties> {
	const internalColumnProperties: Record<string, ComponentTypeProperties> = {};

	for (const key of Object.keys(columnProperties)) {
		let colProp: ComponentTypeProperties = columnProperties[key as keyof typeof columnProperties];
		colProp = Object.assign({}, componentTypes.generic.defaultTypeProperties, colProp);

		if (!colProp.type) {
			throw new Error(`Config for datatable column "${key}" has to type`);
		}

		const componentType = componentTypes[colProp.type];

		if (componentType.defaultTypeProperties) {
			colProp = Object.assign({}, componentType.defaultTypeProperties, colProp);
		}

		if (componentType.forcedTypeProperties) {
			colProp = Object.assign({}, colProp, componentType.forcedTypeProperties);
		}

		internalColumnProperties[key] = colProp;
	}

	return internalColumnProperties;
}
