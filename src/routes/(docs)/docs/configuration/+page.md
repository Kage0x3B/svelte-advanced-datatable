---
title: Configuration Reference
---

# Configuration Reference

Every key on `DataTableConfig`. Grouped by topic; each row links to the guide that covers it in depth.

```typescript
import type { DataTableConfig } from 'svelte-advanced-datatable';
import { ComponentType } from 'svelte-advanced-datatable';

const config: DataTableConfig<UserData> = {
    type: 'userData',
    columnProperties: {
        id:       { type: ComponentType.NUMBER },
        userName: { type: ComponentType.STRING }
    },
    dataUniquePropertyKey: 'id',
    messageConfig: {
        id:       { label: 'Id' },
        userName: { label: 'Username' }
    }
};
```

The data source is passed as a separate `dataSource` prop on the `DataTable` component, not inside `config`. Annotate the config object with `DataTableConfig<Data>` for autocomplete and type errors.

## Required

| Key                     | Type                        | Description                                                                                                          |
|:------------------------|:----------------------------|:---------------------------------------------------------------------------------------------------------------------|
| `type`                  | `string`                    | Unique identifier. No whitespace / non-ASCII characters — also used as the default `storageNamespace`.                |
| `columnProperties`      | `TableColumnConfig<Data>`   | One entry per data key. See [Columns & cell types](/docs/guides/columns).                                            |
| `dataUniquePropertyKey` | `keyof Data & string`       | The row's stable identifier (e.g. `'id'`).                                                                            |
| `messageConfig` *or* `messageFormatter` | `MessageConfig` / formatter | At least one of the two is required — see [Internationalisation](/docs/guides/i18n).                |

## Pagination

→ [Sorting & pagination](/docs/guides/sorting-pagination)

| Key                    | Type        | Description                                                                                          | Default                |
|:-----------------------|:------------|:-----------------------------------------------------------------------------------------------------|:-----------------------|
| `enablePagination`     | `boolean`   | Disable to render every row at once. The data source must return the whole dataset in one response.   | `true`                 |
| `itemsPerPage`         | `number`    | Default page size. User overrides via the settings popover persist.                                  | `50`                   |
| `itemsPerPageOptions`  | `number[]`  | Options in the settings popover's "items per page" select. Pass `[]` to hide it.                     | `[10, 25, 50, 100, 250]` |
| `showTopPagination`    | `boolean`   | Render the pagination row above the table.                                                            | `true`                 |
| `showBottomPagination` | `boolean`   | Render the pagination row below the table. Auto-hidden when fewer than 10 rows are visible.           | `true`                 |

## Search and sort

→ [Search](/docs/guides/search) · [Sorting & pagination](/docs/guides/sorting-pagination)

| Key                 | Type                                                  | Description                                                                                                  | Default                  |
|:--------------------|:------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|:-------------------------|
| `enableSearch`      | `boolean`                                             | Render the search textbox.                                                                                    | `true`                   |
| `searchParser`      | `ISearchParser`                                       | `BasicTextSearchParser` for plain search, `AdvancedSearchParser` for typed filters.                          | `BasicTextSearchParser`  |
| `searchDebounceMs`  | `number`                                              | Delay before the input is committed as a query.                                                               | `200`                    |
| `forcedSearchQuery` | `ForcedSearchQuery<Data>`                             | Override the user's input. Useful for permanent filters or scope pickers.                                     | —                        |
| `defaultSort`       | `{ columnKey?: string; direction?: SortDirection }`   | Initial sort applied on first render.                                                                         | —                        |

## Selection and actions

→ [Selection & actions](/docs/guides/selection-actions)

| Key         | Type                          | Description                                                                                                                                          | Default     |
|:------------|:------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|:------------|
| `actions`   | `DataTableAction<Data>[]`     | Registered actions. Lights up the checkbox column, per-row dropdown and bulk toolbar.                                                                | `[]`        |
| `selection` | `SelectionOptions<Data>`      | Fine-grained tuning — `enabled`, `selectableRows`, `hideRowActionsColumn`, `primaryActionsCount`.                                                    | see guide   |

The `DataTable` component also accepts `bind:selectedIds` and `onSelectionChange` props for two-way binding.

## Export

→ [Export](/docs/guides/export)

| Key               | Type                              | Description                                                                                                                                                                                                          | Default                |
|:------------------|:----------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------|
| `exporters`       | `ExportersConfig<Data> \| false`  | Pluggable exporter map. `false` disables export. Built-in `csv` / `json` keys accept partial overrides; other keys require a full `ExporterOptions` entry. Key insertion order = popover format order.              | `{ csv: {}, json: {} }`|
| `exportChunkSize` | `number`                          | Maximum rows per chunk fetched during a local export.                                                                                                                                                                | `1000`                 |
| `hideExport`      | `boolean`                         | **Deprecated** — prefer `exporters: false`. Honoured only when `exporters` is unset.                                                                                                                                 | `false`                |

## Persistence

→ [Persistence](/docs/guides/persistence)

| Key            | Type                  | Description                                                                                                              | Default |
|:---------------|:----------------------|:-------------------------------------------------------------------------------------------------------------------------|:--------|
| `persistence`  | `PersistenceOptions`  | Backends for transient and persistent state. Defaults preserve pre-persistence behaviour (snapshot transient, no persistent). | `{}`    |

The `DataTable` component also accepts `initialState` and `captureState` props for snapshot/restore control outside SvelteKit's snapshot API.

## Internationalisation

→ [Internationalisation](/docs/guides/i18n)

| Key                       | Type                                                          | Description                                                                                                | Default     |
|:--------------------------|:--------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------|:------------|
| `messageFormatter`        | `'config' \| typeof svelteI18nFormat \| MessageFormatter`     | Source of all strings.                                                                                      | `'config'`  |
| `messageFormatterPrefix`  | `string`                                                      | Prefix prepended to every message id. Only applies to external formatters.                                  | `''`        |
| `messageConfig`           | `MessageConfig<Data>`                                         | Structured static strings. Ignored unless `messageFormatter === 'config'`.                                  | —           |

## Display and row interactions

→ [Display & layout](/docs/guides/display-layout) · [Modals & row interactions](/docs/guides/modal-row-interactions)

| Key                  | Type                                       | Description                                                                                                | Default     |
|:---------------------|:-------------------------------------------|:-----------------------------------------------------------------------------------------------------------|:------------|
| `showTableHeader`    | `boolean`                                  | Render the table header. Headerless tables are not sortable.                                                | `true`      |
| `hideSettings`       | `boolean`                                  | Hide the settings popover (cog icon).                                                                       | `false`     |
| `modalComponent`     | `Component<ModalProps<Data>>`              | Component rendered when a row is clicked.                                                                   | —           |
| `onItemClick`        | `(item: Data) => void`                     | Callback fired when a row is clicked. Mutually exclusive with `buildItemUrl`.                              | —           |
| `buildItemUrl`       | `(item: Data) => string`                   | Turn each row into a link by returning the URL.                                                              | —           |
| `highlightedItemId`  | `string`                                   | ID of a row that should receive the `highlighted` CSS class.                                                | —           |
| `autoOpenSingleItem` | `boolean`                                  | When the result has exactly one row, open the modal automatically.                                          | `false`     |
| `onError`            | `(error: Error) => void`                   | Callback for data-source failures. Fires once per distinct error instance.                                  | —           |

The `DataTable` component (daisyUI flavour) also accepts these props: `stickyHeader`, `striped`, `hoverable`, `size`, `class`, and snippet slots `empty`, `errorState`, `headerFirst`, `headerAfterSearch`, `headerMiddle`, `settingsExtra`. See [Display & layout](/docs/guides/display-layout).
