# Changelog

## [0.15.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.14.3...v0.15.0) (2026-05-18)


### Features

* **a11y:** add scope=col to header cells ([#2](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/2).1) ([b212f81](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/b212f813e7b8652d2c04d6c800bb3742b9c5ae28))
* **a11y:** announce search result count after each search ([#2](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/2).7) ([533e7c2](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/533e7c2c233e4e9fba46929bddc25604de31e85a))
* **a11y:** aria-label on icon-only pagination buttons ([#2](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/2).5) ([4b587bb](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/4b587bb515eb95ee43c302fd7fd3578404c63ede))
* **a11y:** aria-sort on sortable headers + live sort announcement ([#2](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/2).4) ([6d24b0c](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/6d24b0c5d119c8f7ca9cfd4cbcd0edf2c8a15f0e))
* **a11y:** sr-only Yes/No alongside boolean check/cross icons ([#2](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/2).8) ([de7c00b](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/de7c00bc90862018e55383f5826aadcb69d67454))
* **actions:** add isDisabled predicate with reason tooltip ([1974bff](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/1974bff0a850d5e035cd27a2c627e8e2300f7c71))
* **actions:** add shortcut field with parse/match/format utils ([#9](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/9).9) ([0bda5ff](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/0bda5ff0ef081ea531e7aec57b94845a517636c8))
* **actions:** contextMenuExtra snippet for app-specific items ([e02e867](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/e02e8675b0e3e5f1259167065a0b608526d44f3f))
* **actions:** long-press on touch devices opens context menu ([106fb71](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/106fb710ee3ea8c4160907292dcd13f3f5ba433e))
* **actions:** pluralised bulk labels via i18n + bulkLabel field ([da10402](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/da104024cc971242e08e6df53359893796dd9cac))
* **actions:** render shortcut hint in row dropdown + context menu ([#9](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/9).9) ([3695c09](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/3695c09eeb587b91380fbad0e355b5e730a1bc88))
* **actions:** right-click on multi-selection opens bulk context menu ([d3a3563](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/d3a3563ffab4c526f460e7a3bb6c968c252bf90a))
* **actions:** right-click row opens action context menu ([1d91b89](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/1d91b89b38feca0515efd3b74fb48b21dad40122))
* **actions:** support action grouping with menu dividers ([2d167a8](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/2d167a819e89b382594c899d256cd48221771901))
* **actions:** wire shortcut into table keydown dispatcher ([#9](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/9).9) ([ff10462](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/ff104622a12de3c0bec11e88129992f8abbb6682))
* **selection:** Shift+click checkbox extends selection from anchor ([#9](https://github.com/Kage0x3B/svelte-advanced-datatable/issues/9).1) ([6ed1ebf](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/6ed1ebf2b3ac4a821d9e7fce3812cfe51070e5e2))
* **table:** roving tabindex + arrow / Home / End / PageUp/Down nav ([ac8cd8c](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/ac8cd8c1cb2829d81b6faea22f2a489ae378bfed))
* **table:** Space / Shift+Space toggle + Enter default action on focus ([1726f19](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/1726f197ba90fc4e535a8186114e6d4d937c30aa))


### Documentation

* **example:** demo isDisabled, group, bulkLabel, contextMenuExtra ([4b2ea70](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/4b2ea70a166cd5b0d52399a3e744b34a78f87c7d))
* **example:** demo Mod+E and Delete shortcuts on edit/delete actions ([d1b39b6](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/d1b39b6e8cf0d78fa8c3864197c7742727e2dce2))

## [0.14.3](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.14.2...v0.14.3) (2026-05-11)


### Bug Fixes

* **persistence:** read URL from window.location since $app/navigation.replaceState never updates page.url ([fd4de80](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/fd4de800e8f89bb11bb3f3048613a88e4fcdb7d9))

## [0.14.2](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.14.1...v0.14.2) (2026-05-11)


### Bug Fixes

* **persistence:** defer UrlStateStore pendingWrites clear past flush ([5a448c3](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/5a448c36c2d5b9c5a70506075ea7cdcf05991667))


### Documentation

* add four installable Claude Code skill files ([6baa2cf](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/6baa2cf84ed576bf9b75e7db465cc53bca004758))

## [0.14.1](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.14.0...v0.14.1) (2026-05-11)


### Documentation

* restructure into Guides section covering all shipped features ([2d54bdd](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/2d54bdd57cd611dd3068b437400f8778abaf7b20))

## [0.14.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.13.1...v0.14.0) (2026-05-11)


### ⚠ BREAKING CHANGES

* **export:** pluggable exporter config with custom settings components

### Features

* **export:** pluggable exporter config with custom settings components ([030829f](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/030829ff52bf1111f8ceb8f8004b95c7389cddef))

## [0.13.1](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.13.0...v0.13.1) (2026-05-11)


### Bug Fixes

* **dataSource:** decouple setConfig param from Data to unblock IDataSource&lt;unknown&gt; assignment ([b8813f8](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/b8813f8d24e1d258565b00a6ecb5ce73cdc8170b))

## [0.13.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.12.1...v0.13.0) (2026-05-08)


### Features

* **daisyUi:** make stickyHeader default pin to page viewport ([7baf76d](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/7baf76dfe2778130314b63e7f00293f21d112c04))

## [0.12.1](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.12.0...v0.12.1) (2026-05-08)


### Documentation

* refresh README and docs for current feature set ([83dc4f8](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/83dc4f887ef5968f6dcd1304e53bd1f34874fc6b))

## [0.12.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.11.0...v0.12.0) (2026-05-08)


### Features

* **daisyUi:** row selection with bulk + per-row actions ([eb5730e](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/eb5730e8190b529532550e1d4c05acfeb9f439cd))


### Documentation

* **example:** svelte-query-actions demo for selection + actions ([220444c](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/220444c55693940b863adcd51a71c3ff21873c3f))

## [0.11.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.10.0...v0.11.0) (2026-05-08)


### Features

* **daisyUi:** CSV/JSON export popover with mobile-aware toolbar ([b588e8b](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/b588e8b7d2811f524dc9f0c5aba82845099785cd))

## [0.10.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.9.1...v0.10.0) (2026-05-08)


### Features

* **daisyUi:** animate column reorders with svelte/animate flip ([cf8e644](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/cf8e644224620af7608e1e7fc785cd44dd5af4b2))
* **daisyUi:** multi-column sort, density toggle, and column reordering ([f9b9990](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/f9b9990f05c4c45f26efb5afd73a0b8f425e0369))
* **daisyUi:** pin header row when scrolling ([7dbf17e](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/7dbf17ed83857b594d18b285091ec0febc9f1f02))

## [0.9.1](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.9.0...v0.9.1) (2026-05-08)


### Documentation

* update copyright/license year ([24bab5f](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/24bab5fda9056e7a312e1a5b184e6e0d1922c105))

## [0.9.0](https://github.com/Kage0x3B/svelte-advanced-datatable/compare/v0.8.10...v0.9.0) (2026-05-08)


### Features

* add dataComponent barrel export ([10ec804](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/10ec80499907c30f21247ebf7ed18757d232d606))
* configurable search debounce delay ([add46f1](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/add46f1b4271f2a2d8fbce812bd619ca88155bac))
* **daisyUi:** table settings popover, empty/error slots, column resizing ([5c07a0a](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/5c07a0adb7311cbffd68365c0ec87157d0bdfafe))
* make auto-open-single-item behaviour opt-in ([ac23a80](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/ac23a808ff8192d52dcbea22793a658419935c83))
* **persistence:** support object-shaped state via Codec.isEqual ([cb14c83](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/cb14c837aa43bd1281d23a954306bbc4884108d3))
* **persistence:** unified state-storage layer with URL/Snapshot/WebStorage backends ([c0d367a](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/c0d367a5d85002e6f8bdb0c5907c181638893006))
* surface data-source errors via an onError config callback ([6e7a813](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/6e7a81327b7977c32ad5b2defeae087fd3ccafd9))


### Bug Fixes

* cancel pending search-debounce timer on unmount ([16cac65](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/16cac658946af4fdafaed60418073943afc8aa1d))
* **daisyUi:** mirror external searchInput prop changes into the input ([0783c0b](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/0783c0b3f750a36356874ccf5e104c8d0b462ff1))
* **docs:** resolve mdsvex layout paths absolutely ([ff88ca9](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/ff88ca932e28cb5220a3959672150ded5462c2a5))
* **persistence:** replace NoopStateStore with in-memory MemoryStateStore ([0679a6c](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/0679a6c9cab924de26f110978444a65257870d19))
* reset to page 1 when the search query changes ([0f50d4a](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/0f50d4a5cd7284e5b7b55fab3a6698ac8c92eeef))
* stop mutating the source array in LocalDataSource ([4a3f356](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/4a3f356fa129aff0e3d221f98f78e3632ab66952))
* **test:** scope vitest to src/ and point Playwright at the dev server ([10a548d](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/10a548dfb6f2914ee54618b8f3aa93b6c2b97bee))


### Performance

* cancel in-flight fetch requests when a new one is sent ([59fdf7e](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/59fdf7e9de4dad7b40f5fe9689db939f731ff28f))
* memoize column property iteration ([cb45288](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/cb452887cad34c7271149a9d1342eefbd98eba91))


### Documentation

* **examples:** add advanced-search example with filter syntax ([88e8aac](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/88e8aaccfdae460c2b765d088fde78f33e25e462))
* **examples:** add custom-columns example showcasing CUSTOM cells ([631b3f5](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/631b3f5a21711853613508fdaf5856861ceaaf05))
* **examples:** add error-handling example using onError callback ([926de10](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/926de1019fa31552c7c15c531d111cf4b8dc4351))
* **examples:** add url-state example with Playwright coverage ([0598ea1](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/0598ea18e402f64620af38fad501b9e7118d0e32))
* **examples:** exercise the persistent tier in the url-state example ([d00d452](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/d00d4525817a8e8fb11e74f0a9b33e9c9f14a810))
* surface the new examples in the docs sidebar ([871b586](https://github.com/Kage0x3B/svelte-advanced-datatable/commit/871b586cd6020c3830b1668c7e43c3a9a8660cc5))
