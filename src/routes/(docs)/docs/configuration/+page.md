---
title: Configuration
---

# Configuration

The most important part of getting your dataTable ready is the `config` object passed to the `DataTable` component:

```typescript
import type { DataTableConfig } from 'svelte-advanced-datatable';
import { ComponentType } from 'svelte-advanced-datatable';

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
```

!> Annotate your config with [`DataTableConfig`](/api-reference/index/interfaces/DataTableConfig) to get autocompletion and type errors.

## Configuration reference

### Required

| Key                     | Type                | Description                                                                                                                              |
|:------------------------|:--------------------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| `type`                  | `string`            | A unique identifier for this dataTable. Avoid whitespace and non-ASCII characters.                                                       |
| `columnProperties`      | `TableColumnConfig` | One entry per data key. See [Column configuration](/docs/configuration/column-config).                                                   |
| `dataUniquePropertyKey` | `keyof Data`        | Key of the row's stable identifier (e.g. `'id'`).                                                                                        |
| `messageConfig`         | `MessageConfig`     | Object containing all strings used by the dataTable (column labels, button titles, ...). Required unless `messageFormatter` is provided. |

The data source is passed as a separate `dataSource` prop on the `DataTable` component, not inside `config`. See [Data sources](/docs/configuration/data-sources).

### Pagination

| Key                    | Type      | Description                                                                                                  | Default |
|:-----------------------|:----------|:-------------------------------------------------------------------------------------------------------------|:--------|
| `enablePagination`     | `boolean` | Disable to render every row at once. The server must then return the entire dataset in a single response.    | `true`  |
| `itemsPerPage`         | `number`  | Default page size. The user can override this through the settings popover; the chosen value is persisted.   | `50`    |
| `itemsPerPageOptions`  | `number[]`| Options for the settings popover's "items per page" select. Pass `[]` to hide the selector.                  | `[10, 25, 50, 100, 250]` |
| `showTopPagination`    | `boolean` | Show the pagination bar above the table.                                                                     | `true`  |
| `showBottomPagination` | `boolean` | Show the pagination bar below the table. Hidden automatically when fewer than 10 rows are visible.           | `true`  |

### Search and sorting

| Key                | Type                                                  | Description                                                                                                  | Default                  |
|:-------------------|:------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|:-------------------------|
| `enableSearch`     | `boolean`                                             | Show the search textbox.                                                                                     | `true`                   |
| `searchParser`     | `ISearchParser`                                       | Parses the search input. Use `BasicTextSearchParser` for plain search or `AdvancedSearchParser` for filters. | `BasicTextSearchParser`  |
| `searchDebounceMs` | `number`                                              | Delay before committing the search input as a query.                                                         | `200`                    |
| `forcedSearchQuery`| `ForcedSearchQuery`                                   | Search query that overrides the user's input — useful for permanent filters.                                 | `undefined`              |
| `defaultSort`      | `{ columnKey?: string; direction?: SortDirection }`   | Initial sort applied on first render.                                                                        | `undefined`              |

### Selection and actions

| Key         | Type                  | Description                                                                                                                                        | Default     |
|:------------|:----------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------|:------------|
| `actions`   | `DataTableAction[]`   | Registered actions. Adds a checkbox column, per-row dropdown and bulk toolbar automatically. See the [actions example](/example/daisy-ui/svelte-query-actions). | `[]`        |
| `selection` | `SelectionOptions`    | Fine-grained tuning: `enabled`, `selectableRows`, `hideRowActionsColumn`, `primaryActionsCount`.                                                   | see below   |

`SelectionOptions` defaults to `{ primaryActionsCount: 2, hideRowActionsColumn: false }`. Selection chrome is enabled automatically when `actions.length > 0`; set `selection.enabled = true` to enable it without registering any actions.

The `DataTable` component additionally accepts `bind:selectedIds` and `onSelectionChange` props for two-way binding.

### Export

| Key               | Type                | Description                                                                                                                                                                                                                          | Default  |
|:------------------|:--------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------|
| `exporters`       | `ExportersConfig`   | Pluggable export configuration. Object keyed by exporter id — key insertion order is the order shown in the popover's format select. Set to `false` to disable export entirely, or set a specific key to `false` to disable that format. Omit for the default `{ csv: {}, json: {} }`. Built-in `csv` and `json` keys take partial overrides; other keys require `extension`, `mime`, and at least one of `run` (local) / `buildUrl` (remote). | `undefined` |
| `exportChunkSize` | `number`            | Maximum rows per chunk during a local export.                                                                                                                                                                                       | `1000`   |
| `hideExport`      | `boolean`           | Deprecated. Prefer `exporters: false`. Honored only when `exporters` is unset.                                                                                                                                                       | `false`  |

### Persistence and state

| Key            | Type                  | Description                                                                                                          | Default     |
|:---------------|:----------------------|:---------------------------------------------------------------------------------------------------------------------|:------------|
| `persistence`  | `PersistenceOptions`  | Configure session and persistent backends. Defaults preserve previous behaviour (transient state via the snapshot API). | `{}`        |

The `DataTable` component also accepts `initialState` and `captureState` props for explicit snapshot/restore control.

### Display and behaviour

| Key                  | Type                                       | Description                                                                                                | Default     |
|:---------------------|:-------------------------------------------|:-----------------------------------------------------------------------------------------------------------|:------------|
| `showTableHeader`    | `boolean`                                  | Hide the table header row. Tables without a header are not sortable.                                       | `true`      |
| `hideSettings`       | `boolean`                                  | Hide the settings popover (cog icon).                                                                      | `false`     |
| `modalComponent`     | `Component<ModalProps<Data>>`              | Component shown when a row is clicked.                                                                     | `undefined` |
| `onItemClick`        | `(item: Data) => void`                     | Click handler for a row. Mutually exclusive with `buildItemUrl`.                                           | `undefined` |
| `buildItemUrl`       | `(item: Data) => string`                   | Turn each row into a link by returning the URL.                                                            | `undefined` |
| `highlightedItemId`  | `string`                                   | The id of a row that gets the `highlighted` class applied.                                                 | `undefined` |
| `autoOpenSingleItem` | `boolean`                                  | When the result has exactly one row, open the modal automatically.                                         | `false`     |
| `onError`            | `(error: Error) => void`                   | Callback invoked when the data source surfaces an error. Fires once per distinct error.                    | `undefined` |

The DaisyUI `DataTable` component also accepts `stickyHeader`, `striped`, `hoverable`, `size` and several snippet props (`empty`, `errorState`, `headerFirst`, `headerAfterSearch`, `headerMiddle`, `settingsExtra`).

`stickyHeader` accepts `boolean | 'page' | 'container'` (default `true`, equivalent to `'page'`):

- `'page'` pins the header to the viewport while the page scrolls. The container drops `overflow-x-auto`, so a wide table causes page-level horizontal scroll.
- `'container'` pins the header inside `.table-container`. You must height-constrain that container yourself (e.g. wrap it with `max-h-*`); otherwise the page scrolls and the header travels with it.
- `false` disables the sticky header.

### Internationalisation

| Key                       | Type                                                  | Description                                                                                                | Default     |
|:--------------------------|:------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------|:------------|
| `messageFormatter`        | `'config' \| typeof svelteI18nFormat \| MessageFormatter` | Source of all translated strings. `'config'` uses `messageConfig`; pass the svelte-i18n `format` function to delegate to it; or supply a custom formatter. | `'config'`  |
| `messageFormatterPrefix`  | `string`                                              | Prefix prepended to every message id when using an external formatter (e.g. svelte-i18n).                  | `''`        |
