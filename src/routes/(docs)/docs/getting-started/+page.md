# Overview

A configurable, server-aware data table for Svelte 5 with first-class DaisyUI integration.

## Features

- **Server-side or client-side data** via `FetchApiDataSource`, `ApiFunctionDataSource`, `SvelteQueryDataSource` or `LocalDataSource`.
- **Pagination** with an items-per-page selector and configurable defaults.
- **Sorting** — single column, or Shift-click for multi-column sort.
- **Search and filtering** — basic text search or a structured query parser with field aliases.
- **Row selection + actions** — multi-select, bulk-action toolbar, per-row dropdown, primary/destructive variants.
- **Settings popover** — items per page, density toggle, column visibility, column reordering, reset persisted column widths.
- **Column resizing and reordering** with persisted widths and order.
- **Sticky header** that pins while the body scrolls.
- **Export** — CSV / JSON with full delimiter / quoting / line-ending control. Use `buildExportUrl` to delegate large exports to the server.
- **State persistence** with separate session and persistent tiers (sessionStorage / localStorage / custom backend).
- **Internationalisation** through the built-in message config, [svelte-i18n](https://github.com/kaisermann/svelte-i18n) or a custom `MessageFormatter`.
- **Error handling** — `onError` callback plus a customisable `errorState` slot.
- **Custom column components** for fully bespoke cell rendering.

## Quick links

- [Installation](/docs/getting-started/installation)
- [Configuration reference](/docs/configuration)
- [Data source configuration](/docs/configuration/data-sources)
- [Column configuration](/docs/configuration/column-config)
- [API reference](/api-reference)
