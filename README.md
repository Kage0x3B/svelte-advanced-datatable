# svelte-advanced-datatable

(Documentation is still WIP)

## Features

* Highly configurable datatable
* Data pagination
* Sorting, searching/filtering the data
* Compatible with the [sveltestrap](https://sveltestrap.js.org) (Bootstrap) component framework or your own UI styles by
  implementing a few components
* Supports [svelte-i18n](https://github.com/kaisermann/svelte-i18n) or a custom i18n library
* Data loaded using Fetch-API or the [svelte-query](https://github.com/SvelteStack/svelte-query) library

## Quick Links

* [Documentation](https://svelte-advanced-datatable.js.org), or jump directly to information on the usage with:
    * [Bootstrap + Sveltestrap UI](https://svelte-advanced-datatable.js.org/todo)
    * [Svelte Query as a datasource](https://svelte-advanced-datatable.js.org/todo)
    * [svelte-i18n for localisation](https://svelte-advanced-datatable.js.org/todo)
* [API Documentation](https://svelte-advanced-datatable.js.org)

## Usage

### Installing

```bash
# Install the npm package
npm i svelte-advanced-datatable

# As well as the ui library and data source you want to use
npm i sveltestrap @sveltestack/svelte-query
```

### Basic Datatable

After installing the svelte-advanced-datatable library, import the DataTable component from the package for your ui
library.

To use the component, pass the config object with all required properties to it:

```sveltehtml

<script lang='ts'>
	import type { DataTableConfig } from 'svelte-advanced-datatable';
	import { ComponentType, FetchApiDataSource } from 'svelte-advanced-datatable';
	import { DataTable } from 'svelte-advanced-datatable/sveltestrap';

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

## [View the documentation](https://svelte-advanced-datatable.js.org) for all supported config options and more examples
