---
name: svelte-advanced-datatable-state
description:
    Configure persistence tiers (transient snapshot/url/none + persistent localStorage/sessionStorage/none) and
    internationalisation (built-in messageConfig, svelte-i18n format store, or custom MessageFormatter) for
    svelte-advanced-datatable. Use when persisting table state across reloads or back-navigation, sharing a filtered
    table view via URL, wiring SvelteKit Snapshot, or translating column headers, action labels and popover strings. For
    baseline setup use svelte-advanced-datatable.
---

# svelte-advanced-datatable — persistence & i18n

State persistence and internationalisation are two independent concerns wired through `config`. Defaults keep behaviour
predictable: nothing touches `localStorage` without opt-in, all strings render in English unless `messageConfig` or
`messageFormatter` is set.

## 1. Persistence — two independent tiers

| Tier         | Holds                                                                             | Backends                                           | Default      |
| :----------- | :-------------------------------------------------------------------------------- | :------------------------------------------------- | :----------- |
| `transient`  | page index, search input, sort key/direction, sort tiebreakers, open modal row id | `'snapshot'` \| `'url'` \| `'none'`                | `'snapshot'` |
| `persistent` | items-per-page, column visibility, column widths, column order, density           | `'localStorage'` \| `'sessionStorage'` \| `'none'` | `'none'`     |

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    persistence: {
        transient: 'url',
        persistent: 'localStorage',
        urlPrefix: 'dt', // search-param prefix when transient: 'url'
        storageNamespace: config.type, // storage-key prefix when persistent: 'localStorage'/'sessionStorage'
        urlDebounceMs: 300 // debounce for URL replaceState bursts
    }
};
```

| Option             | Type                                           | Default       |
| :----------------- | :--------------------------------------------- | :------------ |
| `transient`        | `'snapshot' \| 'url' \| 'none'`                | `'snapshot'`  |
| `persistent`       | `'localStorage' \| 'sessionStorage' \| 'none'` | `'none'`      |
| `urlPrefix`        | `string`                                       | `'dt'`        |
| `storageNamespace` | `string`                                       | `config.type` |
| `urlDebounceMs`    | `number`                                       | `300`         |

### Transient backends

- **`'snapshot'`** — wires SvelteKit's [Snapshot API](https://kit.svelte.dev/docs/snapshots). Restores state on
  back-navigation. Survives within the SPA session; lost on full reload. Requires route wiring (see below).
- **`'url'`** — writes `?dt-page=...&dt-q=...&dt-sortCol=...&dt-sortDir=...&dt-sortMore=...&dt-open=...` via
  `replaceState`. Shareable, refresh-survivable, back/forward-aware.
- **`'none'`** — in-memory only. Useful for embedded widgets where state should reset on remount.

Stable URL field keys: `page`, `q`, `sortCol`, `sortDir`, `sortMore`, `open`. **Change `urlPrefix` to disambiguate;
never patch the keys** — they're the wire format.

### Persistent backends

- **`'localStorage'`** — survives reload + tab close.
- **`'sessionStorage'`** — survives reload, lost on tab close.
- **`'none'`** — in-memory only. Settings survive component remounts but reset on reload.

Storage keys are `${storageNamespace}-${field}` (e.g. `userData-columnWidths`). `storageNamespace` defaults to
`config.type` — already unique per table.

### SvelteKit Snapshot wiring (required for `transient: 'snapshot'`)

```svelte
<script lang="ts">
    import type { DataTableState } from 'svelte-advanced-datatable';
    import { DataTable } from 'svelte-advanced-datatable/daisyUi';
    import type { Snapshot } from './$types.js';

    let dataTable = $state<DataTable>();

    export const snapshot: Snapshot<DataTableState | undefined> = {
        capture: () => dataTable?.capture(),
        restore: (s) => dataTable?.restore(s)
    };
</script>

<DataTable bind:this={dataTable} {config} {dataSource} />
```

Drive state from outside SvelteKit by passing `initialState` + `captureState` directly:

```svelte
<DataTable {config} {dataSource} initialState={savedState} captureState={(s) => persistToBackend(s)} />
```

### Multiple tables on one route

Two tables sharing `transient: 'url'` will fight over the same query params unless they use different prefixes. Same for
storage namespaces. The library logs a console warning on collision.

```typescript
const usersConfig = { type: 'users', persistence: { transient: 'url', urlPrefix: 'u' } };
const projectsConfig = { type: 'projects', persistence: { transient: 'url', urlPrefix: 'p' } };
```

### Common recipes

| Goal                                           | Persistence                                                |
| :--------------------------------------------- | :--------------------------------------------------------- |
| Shareable filtered view + column prefs persist | `{ transient: 'url', persistent: 'localStorage' }`         |
| Back-navigation restore only                   | `{ transient: 'snapshot' }` + Snapshot wiring on the route |
| Embedded widget that resets on mount           | `{ transient: 'none', persistent: 'none' }`                |
| Two tables on one route, both URL-shareable    | give each a distinct `urlPrefix`                           |

Escape hatch for fully custom backends: `createStores` from `svelte-advanced-datatable/persistence`.

## 2. Internationalisation — three sources

Every visible string flows through one `MessageFormatter`. Pick a source via `messageFormatter`.

| Source                       | When to use                                                                |
| :--------------------------- | :------------------------------------------------------------------------- |
| `'config'` (default)         | Hard-coded strings on the config; the package's English defaults merge in. |
| svelte-i18n `format` store   | App already uses svelte-i18n with locale JSON bundles.                     |
| Custom `MessageFormatter` fn | ICU, Lingui, react-intl-style, or a `Map`-backed lookup.                   |

### Source 1 — built-in `messageConfig`

Default when `messageConfig` is set (`messageFormatter: 'config'` is implicit). Deep-merged onto English defaults, so
partial configs work — set only the keys you override.

```typescript
const config: DataTableConfig<UserData> = {
    type: 'userData',
    columnProperties: {
        /* ... */
    },
    dataUniquePropertyKey: 'id',
    messageFormatter: 'config',
    messageConfig: {
        // Column-level entries — key matches columnProperties key
        id: { label: 'Id' },
        userName: { label: 'Username', format: '@{value}' },
        firstName: { label: 'First name' },
        gender: { label: 'Gender', enumValue: { male: 'Male', female: 'Female' } },

        // Global blocks
        pagination: { previous: 'Previous', next: 'Next', first: 'First', last: 'Last' },
        search: { placeholder: 'Search', ariaLabel: 'Search users' },
        actions: { selectedCount: '{count} selected', edit: 'Edit', delete: 'Delete' },
        export: { button: 'Export', title: 'Export rows' /* ... */ }
    }
};
```

Interpolation placeholders: `{value}` (the row value), `{count}` (selection count). Per-action labels at `actions.<key>`
(the `key` matches `DataTableAction.key`).

### Source 2 — svelte-i18n

```typescript
import { format, addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
import localeEn from './locales/en.json';
import localeDe from './locales/de.json';

addMessages('en', localeEn);
addMessages('de', localeDe);
init({ fallbackLocale: 'en', initialLocale: getLocaleFromNavigator() });

const config: DataTableConfig<UserData> = {
    // ...
    messageFormatter: format,
    messageFormatterPrefix: '' // e.g. 'datatable.' if your bundle nests these
};
```

Mirror the `messageConfig` shape inside your locale JSON. Per-column labels live at
`dataTable.<config.type>.<key>.label`. Pagination/search/actions/export live at top-level keys.

```json
{
    "search": { "placeholder": "Search", "ariaLabel": "Search" },
    "pagination": { "previous": "Previous", "next": "Next", "first": "First", "last": "Last" },
    "dataTable": {
        "userData": {
            "id": { "label": "Id" },
            "userName": { "label": "Username", "format": "@{value}" },
            "gender": { "label": "Gender", "enumValue": { "male": "Male", "female": "Female" } }
        }
    }
}
```

### Source 3 — custom `MessageFormatter`

```typescript
import type { MessageFormatter } from 'svelte-advanced-datatable';

const formatter: MessageFormatter = (id, opts) => {
    const raw = bundle[locale]?.[id] ?? opts?.default ?? id;
    return interpolate(raw, opts?.values ?? {});
};

const config: DataTableConfig<UserData> = { /* ... */ messageFormatter: formatter };
```

Use `createMessageFormatter` (root export) when you need a `MessageFormatter` instance built from the resolved config —
e.g. inside a custom exporter `run` callback.

### i18n options

| Option                   | Type                                               | Default    |
| :----------------------- | :------------------------------------------------- | :--------- |
| `messageFormatter`       | `'config' \| svelteI18nFormat \| MessageFormatter` | `'config'` |
| `messageFormatterPrefix` | `string`                                           | `''`       |
| `messageConfig`          | `MessageConfig<Data>`                              | —          |

## See also

- Persistence guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/persistence>
- i18n guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/i18n>
- `DataTableState` (capture/restore shape):
  <https://svelte-advanced-datatable.moritz.website/api-reference/index/interfaces/DataTableState>
- `MessageConfig`: <https://svelte-advanced-datatable.moritz.website/api-reference/index/type-aliases/MessageConfig>
