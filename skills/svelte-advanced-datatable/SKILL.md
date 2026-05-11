---
name: svelte-advanced-datatable
description:
    Scaffold or modify a Svelte 5 DataTable using the svelte-advanced-datatable package — DataTableConfig, column types
    (ComponentType.STRING/NUMBER/BOOLEAN/DATE/ENUM/CUSTOM), sort, pagination, sticky-header, density, snippet slots,
    daisyUI rendering. Use when adding a new table, defining columns, or tuning baseline display. For data fetching,
    search and errors use svelte-advanced-datatable-data; for selection, modal and export use
    svelte-advanced-datatable-interactions; for persistence and i18n use svelte-advanced-datatable-state.
---

# svelte-advanced-datatable — setup, columns, layout

Server-aware data table for Svelte 5 with first-class daisyUI rendering. This skill covers the things every table needs:
install, the import map, the `DataTableConfig` skeleton, column types, sorting, pagination, and the visual chrome of the
`<DataTable>` component. Defer to the sibling skills for feature-specific concerns (see end of file).

## 1. Install

```bash
pnpm add svelte-advanced-datatable
```

Required peer: `svelte` (5.x). Optional peers, only needed if you use the matching features: `@sveltejs/kit`,
`svelte-i18n`, `@tanstack/svelte-query` / `@tanstack/query-core`.

The daisyUI flavour (`svelte-advanced-datatable/daisyUi`) is the only shipped renderer. Set up Tailwind + daisyUI in the
consuming app first — follow <https://daisyui.com/docs/install>.

## 2. Import map — pick from the right subpath

Importing from the wrong subpath is the most common scaffolding mistake. The table component is **never** at the root.

| Symbol                                                                                                                                                                                                                                                                                                          | Import from                                                           |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `<DataTable>`, `<DaisyUiDataTableExport>` (Svelte components)                                                                                                                                                                                                                                                   | `svelte-advanced-datatable/daisyUi`                                   |
| `DataTableConfig`, `DataTableAction`, `ModalProps`, `PaginatedListRequest`, `PaginatedListResponse`, `SelectionId`, `SelectionOptions`, `MessageFormatter`, `MessageConfig`, `createMessageFormatter`, `invokeAction`, `wrapFetchToThrow`, `DataTableState`, `CustomComponentProps`, `*ComponentTypeProperties` | `svelte-advanced-datatable` (root)                                    |
| `ComponentType` enum                                                                                                                                                                                                                                                                                            | `svelte-advanced-datatable` (root, re-exported)                       |
| `LocalDataSource`, `FetchApiDataSource`, `ApiFunctionDataSource`, `AbstractDataSource`, `IDataSource`, `QueryResult`, `ApiFunction`                                                                                                                                                                             | `svelte-advanced-datatable` or `svelte-advanced-datatable/dataSource` |
| `SvelteQueryDataSource`                                                                                                                                                                                                                                                                                         | `svelte-advanced-datatable/dataSource/svelteQuery`                    |
| `BasicTextSearchParser`, `AdvancedSearchParser`, `ISearchParser`, `ParsedSearchQuery`                                                                                                                                                                                                                           | `svelte-advanced-datatable/searchParser`                              |
| `builtinCsvExporter`, `builtinJsonExporter`, `CsvExportSettings`, `resolveExportResult`, `ExporterOptions`, `ExportRunContext`, `ExportBuildUrlContext`, `ExporterSettingsProps`                                                                                                                                | `svelte-advanced-datatable/export`                                    |
| `PersistenceOptions`, `createStores`                                                                                                                                                                                                                                                                            | `svelte-advanced-datatable/persistence`                               |

## 3. Canonical config skeleton

```svelte
<script lang="ts">
    import type { DataTableConfig } from 'svelte-advanced-datatable';
    import { ComponentType, LocalDataSource } from 'svelte-advanced-datatable';
    import { DataTable } from 'svelte-advanced-datatable/daisyUi';

    interface UserData {
        id: number;
        userName: string;
    }

    const config: DataTableConfig<UserData> = {
        type: 'userData', // stable id, ASCII, no whitespace — also the default storageNamespace
        columnProperties: {
            id: { type: ComponentType.NUMBER },
            userName: { type: ComponentType.STRING }
        },
        dataUniquePropertyKey: 'id', // keyof UserData — the row's stable identifier
        messageConfig: {
            // at least one of messageConfig OR messageFormatter is required
            id: { label: 'Id' },
            userName: { label: 'Username' }
        }
    };

    const dataSource = new LocalDataSource<UserData>(users);
</script>

<DataTable {config} {dataSource} />
```

Rules:

- Always annotate `config` with `DataTableConfig<Data>` so TypeScript narrows `columnProperties` keys against `Data`.
- `dataSource` is a **separate prop on `<DataTable>`**, never inside `config`.
- `type` must be unique per page (used as the persistence namespace key, and to detect collisions when multiple tables
  share a route).

## 4. Columns & cell types

`columnProperties` maps each data key to a `ComponentTypeProperties` entry. `type` is the only required field.

### Shared properties (every column inherits `GenericComponentTypeProperties`)

| Property                | Type                      | Default | Notes                                                                               |
| :---------------------- | :------------------------ | :------ | :---------------------------------------------------------------------------------- |
| `sortable`              | `boolean`                 | `true`  | Header click sorts by this column. Set `false` for derived/custom cells.            |
| `hidden`                | `boolean`                 | `false` | Hard-hide. Never rendered, never offered in the column-visibility list.             |
| `alwaysVisible`         | `boolean`                 | `false` | Force the column on; suppresses it from the visibility toggle.                      |
| `resizable`             | `boolean`                 | `true`  | Drag the right edge of the header to resize.                                        |
| `formatValue`           | `(value, item) => string` | —       | Custom display formatter. Prefer this over `CUSTOM` when you only need a string.    |
| `formatValueEnableHtml` | `boolean`                 | `false` | Render `formatValue`'s return value as HTML via `{@html}`. **XSS risk — sanitise.** |

### Type-specific properties

- **`ComponentType.STRING` / `ComponentType.NUMBER`** — no extra props. STRING renders as text, NUMBER right-aligned.
  Use `formatValue` for currency/units.
- **`ComponentType.BOOLEAN`** — `truthy` (value loosely compared against the cell, default `true`), `inverted` (render
  opposite).
- **`ComponentType.DATE`** — accepts luxon `DateTime` or native `Date`. `dateFormat: Intl.DateTimeFormatOptions`
  overrides the default `DATETIME_MED`-like format.
- **`ComponentType.ENUM`** — `values: string[]` (exhaustive list, also drives export-header order),
  `enumColorKey: Partial<Record<Enum | 'default' | 'unknown', WrappedComponentColor | string>>` for daisyUI badge
  colours. Pair with `messageConfig.<key>.enumValue` to translate visible labels.
- **`ComponentType.CUSTOM`** — `component: Component<CustomComponentProps<Value>>` or `snippet` (when closures over
  local state are needed). Cells receive `{ key, value, item, colProps }`. Set `sortable: false` unless the data source
  can sort the underlying field. **Custom interactive cells must call `event.stopPropagation()` in click handlers** —
  otherwise the row click handler also fires (modal open / `onItemClick` / `buildItemUrl`).

```typescript
columnProperties: {
    role:   { type: ComponentType.ENUM, values: ['admin', 'editor', 'viewer'],
              enumColorKey: { admin: 'error', editor: 'warning', viewer: 'info' } },
    budget: { type: ComponentType.NUMBER,
              formatValue: (v) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(v as number) },
    avatar: { type: ComponentType.CUSTOM, sortable: false, component: AvatarCell }
}
```

## 5. Sorting & pagination

Both are on by default. Header click sets the primary sort; **Shift-click appends tiebreakers** (multi-column sort is
automatic, no config). The primary plus tiebreakers ship to the data source as `orderBy` + `additionalOrderBy` on every
`PaginatedListRequest`.

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    defaultSort: { columnKey: 'lastName', direction: 'asc' },
    enablePagination: true,
    itemsPerPage: 25, // seed; user overrides persist
    itemsPerPageOptions: [10, 25, 50, 100, 250], // [] hides the per-page selector
    showTopPagination: true,
    showBottomPagination: true // auto-hides when < 10 rows visible
};
```

Set `enablePagination: false` only for small bounded datasets — the data source must then return everything in one
response.

## 6. Display & layout — `<DataTable>` props

These live on the component, not in `config`:

| Prop           | Type                                   | Default             | Notes                                                                                                                                                                           |
| :------------- | :------------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stickyHeader` | `boolean \| 'page' \| 'container'`     | `true` (= `'page'`) | `'page'` pins to viewport (page scrolls horizontally on wide tables). `'container'` pins inside `.table-container` — you must height-constrain the container. `false` disables. |
| `striped`      | `boolean`                              | `false`             | daisyUI `table-zebra`.                                                                                                                                                          |
| `hoverable`    | `boolean`                              | `true`              | Row hover highlight.                                                                                                                                                            |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`              | Initial daisyUI table size. **Density is also user-toggleable via the settings popover and persists** — only set this when the embedding view needs a fixed look.               |
| `class`        | `ClassValue`                           | —                   | Forwarded to the table wrapper. Use for shadows, rounded corners, max-widths.                                                                                                   |

Settings popover (cog icon) controls: column visibility, column reorder, items-per-page select, density toggle, reset
persisted column widths. Suppress with `hideSettings: true` on `config`.

Pin a column out of the visibility toggle list with `alwaysVisible: true`; permanently exclude one with `hidden: true`.

## 7. Snippet slots

Optional `Snippet`s for app-specific chrome:

| Snippet             | Args               | Position                                                          |
| :------------------ | :----------------- | :---------------------------------------------------------------- |
| `headerFirst`       | —                  | Leftmost slot in the header bar, before the search field.         |
| `headerMiddle`      | —                  | Between the search field and right-aligned chrome.                |
| `headerAfterSearch` | —                  | Immediately right of the search field, before bulk-action chrome. |
| `settingsExtra`     | —                  | Bottom of the settings popover.                                   |
| `empty`             | —                  | Body slot when zero rows match.                                   |
| `errorState`        | `{ error: Error }` | Body slot when the data source surfaces an error.                 |

## 8. When to switch skills

| Task                                                                           | Skill                                    |
| :----------------------------------------------------------------------------- | :--------------------------------------- |
| Wiring a backend / `LocalDataSource` / search filters / error toasts           | `svelte-advanced-datatable-data`         |
| Row actions, bulk toolbar, modal-on-click, link-on-click, CSV/JSON export      | `svelte-advanced-datatable-interactions` |
| URL-shareable state, localStorage column prefs, svelte-i18n / custom formatter | `svelte-advanced-datatable-state`        |

## See also

- Full docs: <https://svelte-advanced-datatable.moritz.website/docs>
- Configuration reference: <https://svelte-advanced-datatable.moritz.website/docs/configuration>
- API reference: <https://svelte-advanced-datatable.moritz.website/api-reference>
