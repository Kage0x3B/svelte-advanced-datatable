# Svelte Advanced DataTable

(Documentation is still WIP)

## Features

* Highly configurable dataTable
* Data pagination
* Sorting, searching/filtering the data
* Compatible with the [sveltestrap](https://sveltestrap.js.org) (Bootstrap) component framework or your own UI styles by
implementing a few components
* Supports [svelte-i18n](https://github.com/kaisermann/svelte-i18n) or a custom i18n library
* Data loaded using Fetch-API or the [svelte-query](https://github.com/SvelteStack/svelte-query) library

## Quick Links

* [Documentation](https://svelte-advanced-dataTable.pages.dev/docs), or jump directly to information on the usage with:
  * [Bootstrap + Sveltestrap UI](https://svelte-advanced-dataTable.pages.dev/docs/getting-started/quick-start)
  * [Svelte Query as a datasource](https://svelte-advanced-dataTable.pages.dev/docs/configuration/data-sources#using-svelte-query)
  * [svelte-i18n for localisation](https://svelte-advanced-dataTable.pages.dev)
* [API Reference](https://svelte-advanced-dataTable.pages.dev/api-reference)

## Usage

### Installing

```bash
# Install the npm package
npm i svelte-advanced-dataTable

# As well as the ui library and data source you want to use
npm i skeleton @sveltestack/svelte-query
```

### Basic DataTable

After installing the svelte-advanced-dataTable library, import the DataTable component from the package for your ui
library.

To use the component, pass the config object with all required properties to it:

```html
<script lang='ts'>
	import type { DataTableConfig } from 'svelte-advanced-dataTable';
	import { ComponentType, FetchApiDataSource } from 'svelte-advanced-dataTable';
	import { DataTable } from 'svelte-advanced-dataTable/daisyUi';

	interface UserData {
		id: number;
		userName: string;
	}

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
		dataSource: new FetchApiDataSource('/api/users/list'),
		dataUniquePropertyKey: 'id',
		messageConfig: {
			id: {
				label: 'Id'
			},
			userName: {
				label: 'Username'
			}
		}
	};
</script>

<DataTable {config} />
```

## [View the documentation](https://svelte-advanced-dataTable.pages.dev/docs) for all supported config options and more examples
