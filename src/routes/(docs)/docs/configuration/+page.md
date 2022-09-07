---
title: Configuration
---

# Configuration

The most important part of getting your datatable ready to be used is the proper configuration.
The DataTable component accepts a `config` object, which has the following shape:

```typescript
import type { DataTableConfig } from 'svelte-advanced-datatable';
import { ComponentType } from 'svelte-advanced-datatable'; import { UserData } from './UserData.js';

const config: DataTableConfig<UserData> = {
	type: 'userData',
	columnProperties: {
		id: {
			type: ComponentType.NUMBER
		},
		userName: {
			type: ComponentType.STRING
		}
	},
	...additionalConfigOptions
};
```

!> If you use TypeScript, you can annotate your config with the [DataTableConfig](/api-reference/interfaces/DataTableConfig) type to get autocompletion tips and errors from your IDE.

## Configuration Reference

The configuration has the following options:


| Key                          | Type                                                | Description                                                                                                                                                                           | Default Value                     |
|:-----------------------------|:----------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------|
| `type`                       | `string`                                            | A unique identifier/name for this datatable. Should not contain whitespaces and non-ascii characters                                                                                  | required                          |
| `columnProperties`           | `TableColumnConfig`                                 | An object with one key for each key in the data, containing configuration options for each table column                                                                               | required                          |
| `dataSource`                 | `IDataSource`                                       | The data source where the datatable requests the table data from. See [Data Source Configuration](/docs/configuration/data-sources) for more information                              | required                          |
| `dataUniquePropertyKey`      | `string`                                            | The key of your items unique identifier. For example a user id or a counter value which increases by one for each item, as long as it's unique for each item                          | required                          |
| `messageFormatterType`       | `'config' ⎮ 'svelte-i18n'`                          | Whether to use the messageConfig or the svelte-i18n library to provide all strings used by the datatable                                                                              | `'config'`                        |
| `messageFormatterPrefix`     | `string`                                            | Prefix for every message id. Only applies to external message formatters such as the svelte-i18n formatter.                                                                           | `''`                              |
| `messageConfig`              | `string`                                            | An object containing all strings used by the datatable, such as table headers, titles of buttons and more.<br/>Ignored if svelte-i18n is enabled by the `messageFormatterType` option | required if not using svelte-i18n |
| `additionalMessageFormatter` | `MessageFormatter`                                  | A custom message formatter which can return a replacement or undefined to default to the message provided by the internal formatter/svelte-i18n                                       | `undefined`                       |
| `modalComponent`             | `SvelteComponent`                                   | A svelte component shown when a user clicks on a row to expand it                                                                                                                     | `undefined`                       |
| `onItemClick`                | `(item: YourData) => void`                          | An onClick handler for a table row. Gets passed the data item which the clicked row displays                                                                                          | `undefined`                       |
| `forcedSearchQuery`          | `ForcedSearchQuery`                                 | A search query which overwrites any values by the users current search. Can be used to apply a forced filter to the whole datatable                                                   | `undefined`                       |
| `highlightedItemId`          | `string⎮ Readable<string>`                          | The identifier of any item which then gets assigned the `highlighted` class                                                                                                           | `undefined`                       |
| `defaultSort`                | `{ columnKey?: string; direction?: SortDirection }` | Sort the table using the given key and direction by default                                                                                                                           | `undefined`                       |
| `enablePagination`           | `boolean`                                           | Whether to enable or disable pagination entirely.<br/>Watch out that the server must send all table rows at once if this is disabled.                                                 | `true`                            |
| `showTopPagination`          | `boolean`                                           | If the pagination component at the top of the datatable should be shown                                                                                                               | `true`                            |
| `showBottomPagination`       | `boolean`                                           | If the pagination component at the bottom of the datatable should be shown. Notice that the bottom pagination is always hidden when less than 10 rows are shown                       | `true`                            |
| `itemsPerPage`               | `number`                                            | Maximum amount of rows shown on one page                                                                                                                                              | `50`                              |
| `enableSearch`               | `boolean`                                           | Whether to show the search textbox                                                                                                                                                    | `true`                            |
| `searchParser`               | `ISearchParser`                                     | Which search parser to use to parse the users search text into search filters, categories and more                                                                                    | `BasicSearchTextParser`           |

