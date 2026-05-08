# Svelte Advanced DataTable

A configurable, server-aware data table for Svelte 5 with first-class support for [DaisyUI](https://daisyui.com).

## Features

- **Server-side or client-side data** — `FetchApiDataSource`, `ApiFunctionDataSource`, `SvelteQueryDataSource`, or `LocalDataSource` (client-side filter, sort, paginate).
- **Pagination** with configurable page size and an items-per-page selector.
- **Sorting** — click to sort, Shift-click for multi-column sort.
- **Search and filtering** — basic text search or a structured query parser with field aliases.
- **Row selection and actions** — single + multi-select with a bulk action toolbar, per-row dropdown, primary/destructive variants, two-way `bind:selectedIds`.
- **Settings popover** — items per page, density (compact/default/spacious), column visibility, column reordering, reset persisted column widths.
- **Column resizing and reordering** with persisted widths and order.
- **Sticky header** that pins while the body scrolls.
- **Export** — CSV / JSON popover with delimiter, quoting and line-ending options. Use `buildExportUrl` to delegate large exports to the server.
- **State persistence** — separate session and persistent tiers (sessionStorage / localStorage / custom backend) for page, sort, search, column order, widths, density and items-per-page.
- **Internationalisation** — built-in message config, [svelte-i18n](https://github.com/kaisermann/svelte-i18n), or a custom `MessageFormatter`.
- **Error handling** — `onError` callback plus a customisable `errorState` slot.
- **Custom column components** for fully bespoke cell rendering.

## Quick links

- [Documentation](https://svelte-advanced-datatable.pages.dev/docs)
- [Getting started](https://svelte-advanced-datatable.pages.dev/docs/getting-started/installation)
- [Data source configuration](https://svelte-advanced-datatable.pages.dev/docs/configuration/data-sources)
- [API reference](https://svelte-advanced-datatable.pages.dev/api-reference)

## Installation

```bash
# Install Tailwind CSS and DaisyUI first (see https://daisyui.com/docs/install)

pnpm add svelte-advanced-datatable
```

## Basic usage

```svelte
<script lang="ts">
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
            id: { type: ComponentType.NUMBER },
            userName: { type: ComponentType.STRING }
        },
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: { label: 'Id' },
            userName: { label: 'Username' }
        }
    };

    const dataSource = new FetchApiDataSource<UserData>('/api/users/list');
</script>

<DataTable {config} {dataSource} />
```

## Selection + actions

Register `actions` to automatically get a checkbox column, a per-row dropdown and a bulk toolbar:

```svelte
<script lang="ts">
    import type { SelectionId } from 'svelte-advanced-datatable';

    let selectedIds: SelectionId[] = $state([]);

    const config: DataTableConfig<UserData> = {
        // ...other options
        actions: [
            { key: 'edit', onSingle: (user) => editUser(user) },
            { key: 'archive', primary: true, onMulti: (ids) => archive(ids) },
            { key: 'delete', variant: 'destructive', primary: true, onMulti: (ids) => remove(ids) }
        ]
    };
</script>

<DataTable {config} {dataSource} bind:selectedIds />
```

See the [`/example/daisy-ui/svelte-query-actions`](https://svelte-advanced-datatable.pages.dev/example/daisy-ui/svelte-query-actions) page for a working demo.

## [Open the documentation](https://svelte-advanced-datatable.pages.dev/docs) for the full configuration reference and more examples.
