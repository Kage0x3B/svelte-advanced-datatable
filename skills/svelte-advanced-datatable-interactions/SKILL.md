---
name: svelte-advanced-datatable-interactions
description:
    Wire row selection, per-row + bulk actions (DataTableAction with onSingle/onMulti, primary/destructive variants),
    row click behaviour (modalComponent, onItemClick, buildItemUrl — mutually exclusive), and CSV/JSON export for
    svelte-advanced-datatable. Use when adding action buttons, opening a modal on row click, configuring
    bind:selectedIds, customising exporters, or delegating exports to the server via buildUrl. For baseline setup use
    svelte-advanced-datatable; for data sources use svelte-advanced-datatable-data; for persisting selection or
    translating action labels use svelte-advanced-datatable-state.
---

# svelte-advanced-datatable — selection, actions, modals, export

How users interact with rows: selection, actions (per-row dropdown + bulk toolbar), what happens on row click (modal /
callback / link), and exporting the visible dataset.

## 1. Actions — `DataTableAction<Data>[]`

Declaring even one action lights up the entire selection UI: a leading checkbox column, a trailing three-dot per-row
dropdown, and a bulk toolbar that slides in beside the search field when ≥1 row is selected. Selection persists across
pagination — cross-page bulk ops work out of the box.

```typescript
import type { DataTableAction, DataTableConfig, SelectionId } from 'svelte-advanced-datatable';

const config: DataTableConfig<UserData> = {
    // ...
    actions: [
        { key: 'edit', icon: PencilIcon, onSingle: (item) => openEditDialog(item) },
        { key: 'archive', icon: ArchiveIcon, primary: true, onMulti: (ids) => archiveUsers(ids) },
        { key: 'delete', icon: TrashIcon, primary: true, variant: 'destructive', onMulti: (ids) => deleteUsers(ids) }
    ],
    messageConfig: {
        // ...column labels...
        actions: { edit: 'Edit', archive: 'Archive', delete: 'Delete' }
    }
};
```

| Property              | Type                                            | Default                              | Notes                                                                                                  |
| :-------------------- | :---------------------------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `key`                 | `string`                                        | required                             | Stable id. Used as list key AND as `messageConfig.actions.<key>` lookup for the label.                 |
| `icon`                | `Component`                                     | —                                    | Svelte icon component. Size via tailwind (e.g. `class="size-4"`).                                      |
| `variant`             | `'default' \| 'primary' \| 'destructive'`       | `'default'`                          | `destructive` = red.                                                                                   |
| `primary`             | `boolean`                                       | `false`                              | Render as standalone button in the bulk toolbar (else in "More" overflow). Cap: `primaryActionsCount`. |
| `hideInRow`           | `boolean`                                       | `false`                              | Suppress in the per-row dropdown.                                                                      |
| `hideInBulk`          | `boolean`                                       | `false` (implicit when no `onMulti`) | Suppress in the bulk toolbar.                                                                          |
| `rowVisible`          | `(item) => boolean`                             | —                                    | Per-row gate for the row dropdown.                                                                     |
| `onSingle`            | `(item) => void \| Promise<void>`               | —                                    | Row-dropdown handler. Receives the full row.                                                           |
| `onMulti`             | `(ids: SelectionId[]) => void \| Promise<void>` | —                                    | Bulk-toolbar handler. Receives **IDs only** — cross-page rows aren't loaded.                           |
| `refreshAfter`        | `boolean`                                       | `true`                               | Call `dataSource.refresh()` after the handler resolves.                                                |
| `clearSelectionAfter` | `boolean`                                       | `true` bulk / `false` single         | Wipe selection after the handler resolves.                                                             |

Rules:

- `onMulti` receives **`SelectionId[]` only** (the row's `dataUniquePropertyKey` values). Refetch with the IDs when you
  need full objects — cross-page selections include rows that aren't in memory.
- When only `onMulti` is supplied, single-row invocations call it with `[id]` — common case for destructive/bulk-shaped
  actions.
- Programmatic trigger: `invokeAction` (root export).

## 2. Selection options & two-way binding

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    selection: {
        enabled: true, // force selection on even without actions
        selectableRows: (item) => item.role !== 'admin', // per-row gate; false renders disabled checkbox
        hideRowActionsColumn: false, // hide the trailing three-dot column
        primaryActionsCount: 2 // cap primary buttons before overflow
    }
};
```

| Property               | Type                | Default              |
| :--------------------- | :------------------ | :------------------- |
| `enabled`              | `boolean`           | `actions.length > 0` |
| `selectableRows`       | `(item) => boolean` | all selectable       |
| `hideRowActionsColumn` | `boolean`           | `false`              |
| `primaryActionsCount`  | `number`            | `2`                  |

`<DataTable>` exposes selection via two complementary props — pick whichever fits, they're not mutually exclusive:

```svelte
<DataTable
    {config}
    {dataSource}
    bind:selectedIds
    onSelectionChange={({ ids, loadedItems }) => {
        // loadedItems is only the currently-rendered subset — cross-page IDs aren't in here
    }}
/>
```

`SelectionId` is the row's `dataUniquePropertyKey` value (string or number).

## 3. Row click behaviour — pick at most one

`modalComponent`, `onItemClick`, `buildItemUrl` are **mutually exclusive**. The table picks the first defined and
ignores the rest.

### Modal

```typescript
import UserDataModal from './UserDataModal.svelte';

const config: DataTableConfig<UserData> = {
    // ...
    modalComponent: UserDataModal,
    autoOpenSingleItem: false,
    highlightedItemId: '42'
};
```

The component receives `ModalProps<Data>` — `item` + a `close()` callback. Library handles open/close state.

```svelte
<script lang="ts">
    import type { ModalProps } from 'svelte-advanced-datatable';
    let { item, close }: ModalProps<UserData> = $props();
</script>
```

### Callback

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    onItemClick: (item) => track('user.row.clicked', item.id)
};
```

Use for side panels, inline edits, telemetry.

### Link

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    buildItemUrl: (item) => `/users/${item.id}`
};
```

The row renders as an `<a>` — middle-click and keyboard navigation behave correctly.

### Options

| Option               | Type                          | Default | Notes                                                                                       |
| :------------------- | :---------------------------- | :------ | :------------------------------------------------------------------------------------------ |
| `modalComponent`     | `Component<ModalProps<Data>>` | —       | Rendered when a row is clicked.                                                             |
| `onItemClick`        | `(item: Data) => void`        | —       | Fires on row click. Exclusive with `buildItemUrl`.                                          |
| `buildItemUrl`       | `(item: Data) => string`      | —       | Renders rows as links. Exclusive with `onItemClick`.                                        |
| `autoOpenSingleItem` | `boolean`                     | `false` | When the result has exactly one row, open the modal automatically. `modalComponent` only.   |
| `highlightedItemId`  | `string`                      | —       | ID of the row that receives the `highlighted` CSS class. Useful for deep-link highlighting. |

**Custom interactive cells must call `event.stopPropagation()`** in their click handlers — otherwise the row click fires
too, opening the modal or navigating away.

## 4. Export

Download button next to the search field opens a popover with one or more formats. CSV and JSON are built in. Default:
both enabled, CSV first.

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    exporters: undefined, // default: { csv: {}, json: {} }
    exportChunkSize: 1000 // max rows per chunk fetched during local export
};
```

### Disabling / trimming / reordering

```typescript
exporters: false                            // remove the download button entirely
exporters: { csv: {}, json: false }         // CSV only
exporters: { json: {}, csv: {} }            // JSON listed first in the popover (insertion order = popover order)
```

### Built-in CSV settings

User-facing, persisted to localStorage:

| Setting         | Type                          | Default |
| :-------------- | :---------------------------- | :------ |
| `delimiter`     | `',' \| ';' \| 'tab' \| '\|'` | `','`   |
| `quoteChar`     | `'"' \| "'"`                  | `'"'`   |
| `lineEnding`    | `'\n' \| '\r\n'`              | `'\n'`  |
| `includeHeader` | `boolean`                     | `true`  |
| `utf8Bom`       | `boolean`                     | `false` |
| `useRawValues`  | `boolean`                     | `false` |

`useRawValues: true` bypasses `formatValue` + message formatter — emits `String(value)`. Use for re-import pipelines.

### Custom exporters — local `run` or remote `buildUrl`

Both paths share `ExporterOptions<Settings, Data>`. Provide both to fall back to local when `buildUrl` returns
`undefined`.

**Local** — produces a `Blob` (or `string`/`ArrayBuffer`) in the browser. Rows are pre-fetched across all pages before
`run` is called.

```typescript
import type { ExporterOptions, ExportRunContext } from 'svelte-advanced-datatable/export';

const xlsx: ExporterOptions<{ freezeHeader: boolean }, UserData> = {
    extension: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    defaultSettings: { freezeHeader: true },
    settingsComponent: XlsxSettings,
    async run(ctx, settings) {
        const { default: ExcelJS } = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        const sheet = wb.addWorksheet('Users');
        sheet.columns = ctx.columns.map((c) => ({ header: c.label, key: c.key }));
        sheet.addRows(ctx.rows);
        if (settings.freezeHeader) sheet.views = [{ state: 'frozen', ySplit: 1 }];
        return await wb.xlsx.writeBuffer();
    }
};
```

`ExportRunContext` provides: `rows` (pre-fetched), `columns` (resolved + translated labels), `config`,
`messageFormatter`, `signal: AbortSignal`. For streaming: `ctx.fetchOnce` + `ctx.baseRequest` + `ctx.chunkSize` drives
your own chunked fetch.

**Remote** — return a URL; the browser navigates. The server emits the file.

```typescript
exporters: {
    csv: false,
    xlsx: {
        extension: 'xlsx',
        mime:      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buildUrl(ctx) {
            const params = new URLSearchParams({
                sort: JSON.stringify(ctx.baseRequest.orderBy),
                q:    ctx.baseRequest.searchQuery?.searchText ?? ''
            });
            return `/api/users/export.xlsx?${params}`;
        }
    }
}
```

`ExportBuildUrlContext` carries no rows — just columns, current request (no pagination), config.

### Settings component contract

```svelte
<script lang="ts">
    import type { ExporterSettingsProps } from 'svelte-advanced-datatable/export';
    let { settings, onsettingschange }: ExporterSettingsProps<{ freezeHeader: boolean }> = $props();
</script>
```

Pair with a `settingsCodec` if the choice should persist; otherwise the popover resets to `defaultSettings` on next
open.

## See also

- Selection & actions guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/selection-actions>
- Modals & row interactions: <https://svelte-advanced-datatable.moritz.website/docs/guides/modal-row-interactions>
- Export guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/export>
- `ModalProps`: <https://svelte-advanced-datatable.moritz.website/api-reference/index/interfaces/ModalProps>
