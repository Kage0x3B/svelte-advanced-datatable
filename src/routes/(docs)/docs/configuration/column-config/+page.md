---
title: Column Configuration
---

# Column Configuration

The `columnProperties` config contains options for each datatable column:

```typescript
import { ComponentType } from './ComponentType.js'; import { DataTableConfig } from './DataTableConfig.js';
const config: DataTableConfig<YourData> = {
	...additionalConfigOptions,
	columnProperties: {
		id: {
			type: ComponentType.NUMBER
		},
		userName: {
			type: ComponentType.STRING
		}
	}
};
```

Each column requires at least the `type` option to be set. The following values are valid types:

| Type                    | Description                                                                                                         |
|-------------------------|---------------------------------------------------------------------------------------------------------------------|
| `ComponentType.NUMBER`  | General JavaScript number type for integers and decimal numbers                                                     |
| `ComponentType.STRING`  | General JavaScript string type                                                                                      |
| `ComponentType.BOOLEAN` | General boolean type with support for unusual boolean-like values, for example string values representing a boolean |
| `ComponentType.ENUM`    | Enum type to display enum values fancier, translate them and have default/unknown value names.                      |
| `ComponentType.DATE`    | Date type supporting the normal JavaScript Date as well as a [luxon DateTime](https://moment.github.io/luxon)       |
| `ComponentType.CUSTOM`  | Custom type to render a table column with a custom svelte component                                                 |

## Column Type Properties

### Generic Properties

Besides the `type` property, all component types have the following (optional) properties:

| Name       | Type      | Description                                                                                                                                        | Default value |
|------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `sortable` | `boolean` | If the values in this column can be sorted by clicking on the table header.<br/>Should usually be turned off for columns using a custom component. | `true`        |
| `hidden`   | `boolean` | Hides this table column                                                                                                                            | `false`       |

?> **Work in Progress!** In the meantime, please take a look at the [Api Reference](/api-reference/interfaces/GenericComponentTypeProperties#hierarchy) for all component type properties.
