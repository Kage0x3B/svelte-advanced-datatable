import type { ComponentTypeProperties, TableColumnConfig } from '$lib/dataComponent/ComponentType.js';
import { componentTypes } from '$lib/dataComponent/ComponentType.js';

export function buildColumnPropertyData<Data>(
    columnProperties: TableColumnConfig<Data>
): Record<string, ComponentTypeProperties> {
    const internalColumnProperties: Record<string, ComponentTypeProperties> = {};

    for (const key of Object.keys(columnProperties)) {
        let colProp: ComponentTypeProperties | undefined = columnProperties[key as keyof typeof columnProperties];

        if (!colProp) {
            continue;
        }

        colProp = Object.assign({}, componentTypes.generic.defaultTypeProperties, colProp);

        if (!colProp.type) {
            throw new Error(`Config for dataTable column "${key}" has to type`);
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
