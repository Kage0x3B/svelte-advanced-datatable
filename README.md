# Svelte Advanced DataTable

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

* [Documentation](https://svelte-advanced-datatable.pages.dev/docs), or jump directly to information on the usage with:
  * [Bootstrap + Sveltestrap UI](https://svelte-advanced-datatable.pages.dev/docs/getting-started/quick-start)
  * [Svelte Query as a datasource](https://svelte-advanced-datatable.pages.dev/docs/configuration/data-sources#using-svelte-query)
  * [svelte-i18n for localisation](https://svelte-advanced-datatable.pages.dev)
* [API Reference](https://svelte-advanced-datatable.pages.dev/api-reference)

## Usage

### Installing

```bash
# Install prerequisites such as TailwindCSS and DaisyUI
...

# Install the npm package
pnpm add -D svelte-advanced-datatable
```

### Basic DataTable

After installing the svelte-advanced-datatable library, import the DataTable component from the package for your ui
library.

To use the component, pass the config object with all required properties to it:

```html
<script lang='ts'>
	import type { DataTableConfig } from 'svelte-advanced-datatable';
	import { ComponentType, FetchApiDataSource } from 'svelte-advanced-datatable';
	import { DataTable } from 'svelte-advanced-datatable/daisyUi';

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
    
    const dataSource = new FetchApiDataSource('/api/users/list');
</script>

<DataTable {config} {dataSource} />
```

## [View the documentation](https://svelte-advanced-datatable.pages.dev/docs) for all supported config options and more examples
