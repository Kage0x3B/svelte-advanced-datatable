# Overview

A configurable, server-aware data table for Svelte 5 with first-class daisyUI integration.

## Features

- **Multiple data sources** — `LocalDataSource`, `FetchApiDataSource`, `ApiFunctionDataSource`, `SvelteQueryDataSource`, or your own `IDataSource`.
- **Pagination** with a configurable items-per-page selector.
- **Sorting** — single column, or Shift-click for multi-column tiebreakers.
- **Search** — basic text search or `AdvancedSearchParser` with typed filters, aliases, and custom query-part parsers.
- **Selection and actions** — multi-select with cross-page persistence, bulk-action toolbar, per-row dropdown, `primary` / `destructive` variants.
- **Settings popover** — items per page, density, column visibility, column reorder, reset persisted column widths.
- **Column resizing and reordering** with persisted widths and order.
- **Sticky header** with viewport (`'page'`) or container (`'container'`) pinning modes.
- **Export** — pluggable exporters keyed by id. Built-in CSV (full delimiter / quoting / line-ending / BOM control) and JSON; register custom formats with a local `run` callback or a remote `buildUrl`.
- **State persistence** — independent transient (snapshot / URL / memory) and persistent (localStorage / sessionStorage / memory) tiers.
- **Internationalisation** — built-in `messageConfig`, [svelte-i18n](https://github.com/kaisermann/svelte-i18n), or a custom `MessageFormatter`.
- **Error handling** — `onError` callback for cross-app surfaces, `errorState` snippet for in-table recovery UI.
- **Custom column components** — full Svelte component or snippet per cell.

## Quick links

- [Installation](/docs/getting-started/installation)
- [Quick start](/docs/getting-started/quick-start)
- [Configuration reference](/docs/configuration)
- [Data sources](/docs/guides/data-sources)
- [Columns & cell types](/docs/guides/columns)
- [Selection & actions](/docs/guides/selection-actions)
- [Export](/docs/guides/export)
- [Persistence](/docs/guides/persistence)
- [Internationalisation](/docs/guides/i18n)
- [API reference](/api-reference)
