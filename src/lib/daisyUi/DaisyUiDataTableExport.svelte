<script lang="ts">
    import { resolveExportResult } from '$lib/export/resolveExportResult.js';
    import { createExportPersistedState, type InternalExportState } from '$lib/persistence/exportPersistence.svelte.js';
    import type { CreatedStores } from '$lib/persistence/createStores.svelte.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import type {
        ExportBuildUrlContext,
        ExportColumn,
        ExportRunContext,
        ResolvedExporter
    } from '$lib/types/Export.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import { configContext, dataSourceContext, messageFormatterContext } from '$lib/util/context.js';
    import { triggerDownload } from '$lib/util/exportDownloadUtil.js';
    import { fetchAllRows } from '$lib/util/exportFetcher.js';
    import { buildExportFilename } from '$lib/util/exportFilenameUtil.js';
    import DownloadIcon from './icons/DownloadIcon.svelte';
    import XIcon from './icons/XIcon.svelte';

    interface Props {
        tableState: InternalDataTableState;
        /** Visible+ordered column keys, in render order. */
        visibleOrderedColumnKeys: string[];
        /** Parsed search query, same one used to drive the live table. */
        searchQuery: ParsedSearchQuery | undefined;
        /** Persistent store handle so export prefs share the table's backend. */
        stores: CreatedStores;
        /**
         * Optional override for the trigger button's class. Lets the toolbar
         * join the export button to a sibling (e.g. the settings button) by
         * passing `'btn btn-ghost btn-sm btn-square join-item'`.
         */
        triggerClass?: string;
    }

    /* svelte-ignore state_referenced_locally */
    let {
        tableState,
        visibleOrderedColumnKeys,
        searchQuery,
        stores,
        triggerClass = 'btn btn-ghost btn-sm btn-circle'
    }: Props = $props();

    const config = $derived(configContext.get().current);
    const dataSource = $derived(dataSourceContext.get().current);
    const format = $derived(messageFormatterContext.get().current);

    const exporters = $derived(config.resolvedExporters);

    /* svelte-ignore state_referenced_locally */
    const exportState: InternalExportState = createExportPersistedState(stores, exporters);

    let triggerEl: HTMLButtonElement | undefined = $state();
    let popoverEl: HTMLDivElement | undefined = $state();

    type Status =
        | { kind: 'idle' }
        | { kind: 'loading'; loaded: number; total: number; controller: AbortController }
        | { kind: 'error'; message: string };

    let status: Status = $state({ kind: 'idle' });

    const selectedExporter: ResolvedExporter<unknown, unknown> = $derived(
        exporters.find((e) => e.id === exportState.selectedId) ?? exporters[0]
    );

    const currentSettings = $derived.by<unknown>(() => {
        const stored = exportState.settings[selectedExporter.id];
        if (stored && typeof stored === 'object') {
            return { ...(selectedExporter.defaultSettings as object), ...(stored as object) };
        }
        return selectedExporter.defaultSettings;
    });

    /** Columns the export will produce, with labels resolved through the
     *  message formatter so headers match what users see on screen. */
    const exportColumns = $derived<ExportColumn[]>(
        visibleOrderedColumnKeys.map((key) => ({
            key,
            label: format(`dataTable.${config.type}.${key}.label`) as string,
            colProps: config.columnProperties[key]
        }))
    );

    /** Base request body — sort + search inherited from current table state, no pagination. */
    const baseRequest = $derived.by<Omit<PaginatedListRequest<unknown>, 'start' | 'amount'>>(() => {
        const orderBy =
            tableState.sortColumnKey && tableState.sortDirection
                ? { column: tableState.sortColumnKey, order: tableState.sortDirection }
                : undefined;
        const additionalOrderBy =
            orderBy && tableState.additionalSort.length > 0
                ? tableState.additionalSort.map((s) => ({ column: s.column, order: s.direction }))
                : undefined;
        return {
            orderBy,
            additionalOrderBy,
            rawSearchQuery: tableState.searchInput,
            searchQuery
        };
    });

    const supportsLocalExport = $derived(typeof dataSource?.fetchOnce === 'function');

    /**
     * Whether the currently-selected exporter can be invoked at all. A remote
     * exporter is assumed to be invokable (we won't know until we call
     * `buildUrl` whether it returns `undefined`); a pure-local exporter
     * requires `fetchOnce`.
     */
    const isInvokable = $derived(
        typeof selectedExporter.buildUrl === 'function' ||
            (typeof selectedExporter.run === 'function' && supportsLocalExport)
    );

    function exporterLabel(id: string): string {
        const fromConfig = format(`dataTable.${config.type}.export.formats.${id}`);
        if (typeof fromConfig === 'string' && fromConfig.length > 0) return fromConfig;
        return id;
    }

    function open() {
        if (!popoverEl) return;
        popoverEl.showPopover();
    }

    function close() {
        if (!popoverEl) return;
        popoverEl.hidePopover();
    }

    function isMobileViewport(): boolean {
        return typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches;
    }

    /**
     * Move the popover element to `document.body` on mount so it isn't
     * counted as a sibling of the trigger button inside a `.join` container.
     * DaisyUI's join border-radius rules use `:first-child` / `:last-child`
     * selectors and would otherwise see the popover div and apply wrong
     * rounding to the settings button next to us.
     */
    function portal(node: HTMLElement) {
        if (typeof document === 'undefined') return {};
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            }
        };
    }

    function positionForDesktop() {
        if (!triggerEl || !popoverEl) return;
        const rect = triggerEl.getBoundingClientRect();
        const popoverWidth = popoverEl.offsetWidth || 320;
        const margin = 8;

        let top = rect.bottom + margin;
        let left = rect.right - popoverWidth;
        if (left < margin) left = margin;
        if (left + popoverWidth + margin > window.innerWidth) {
            left = window.innerWidth - popoverWidth - margin;
        }
        const popoverHeight = popoverEl.offsetHeight || 360;
        if (top + popoverHeight + margin > window.innerHeight && rect.top - popoverHeight - margin >= 0) {
            top = rect.top - popoverHeight - margin;
        }
        popoverEl.style.top = `${top}px`;
        popoverEl.style.left = `${left}px`;
    }

    function handleToggle(event: ToggleEvent) {
        if (event.newState === 'closed') {
            // Closing the popover cancels any in-flight export — matches the
            // "I dismissed the prompt" mental model.
            if (status.kind === 'loading') {
                status.controller.abort();
                status = { kind: 'idle' };
            }
            return;
        }
        if (isMobileViewport()) {
            if (popoverEl) {
                popoverEl.style.top = '';
                popoverEl.style.left = '';
            }
        } else {
            positionForDesktop();
        }
    }

    function updateSettings(id: string, next: unknown) {
        exportState.settings = { ...exportState.settings, [id]: next };
    }

    function buildBuildUrlContext(): ExportBuildUrlContext<unknown> {
        return {
            columns: exportColumns,
            config,
            baseRequest
        };
    }

    function tryBuildUrl(): string | undefined {
        if (typeof selectedExporter.buildUrl !== 'function') return undefined;
        try {
            return selectedExporter.buildUrl(buildBuildUrlContext(), currentSettings);
        } catch (err) {
            console.error('svelte-advanced-datatable: exporter buildUrl threw', err);
            return undefined;
        }
    }

    async function runLocalExport() {
        if (!dataSource.fetchOnce || typeof selectedExporter.run !== 'function') return;

        const controller = new AbortController();
        status = { kind: 'loading', loaded: 0, total: 0, controller };

        try {
            const rows = (await fetchAllRows<unknown>({
                fetchOnce: dataSource.fetchOnce.bind(dataSource),
                baseRequest,
                chunkSize: config.exportChunkSize,
                signal: controller.signal,
                onProgress: (loaded, total) => {
                    if (status.kind === 'loading') {
                        status = { ...status, loaded, total };
                    }
                }
            })) as Record<string, unknown>[];

            if (controller.signal.aborted) return;

            const ctx: ExportRunContext<unknown> = {
                rows,
                columns: exportColumns,
                config,
                format,
                signal: controller.signal,
                baseRequest,
                fetchOnce: dataSource.fetchOnce.bind(dataSource),
                chunkSize: config.exportChunkSize
            };

            const result = await selectedExporter.run(ctx, currentSettings);
            const { blob, extension } = resolveExportResult(result, selectedExporter);
            const filename = buildExportFilename(config.type, extension ?? selectedExporter.extension);
            triggerDownload(blob, filename);
            status = { kind: 'idle' };
            close();
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                status = { kind: 'idle' };
                return;
            }
            const message = err instanceof Error ? err.message : String(err);
            status = { kind: 'error', message };
        }
    }

    /**
     * Decide per-click which path to take:
     *  1. If `buildUrl` returns a string, navigate to it via a synthetic
     *     anchor click (preserves `download={filename}` semantics).
     *  2. Otherwise fall through to the local `run` callback.
     */
    function onDownload() {
        const url = tryBuildUrl();
        if (typeof url === 'string') {
            const filename = buildExportFilename(config.type, selectedExporter.extension);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            close();
            return;
        }
        if (typeof selectedExporter.run === 'function' && supportsLocalExport) {
            void runLocalExport();
        }
    }

    function cancelExport() {
        if (status.kind === 'loading') {
            status.controller.abort();
            status = { kind: 'idle' };
        }
    }

    function resetDefaults() {
        updateSettings(selectedExporter.id, { ...(selectedExporter.defaultSettings as object) });
    }

    const t = (key: string) => format(`dataTable.${config.type}.export.${key}`) as string;
    const SettingsPanel = $derived(selectedExporter.settingsComponent);
</script>

<svelte:window
    onresize={() => {
        if (popoverEl?.matches(':popover-open') && !isMobileViewport()) positionForDesktop();
    }}
/>

<button
    bind:this={triggerEl}
    type="button"
    class={triggerClass}
    aria-label={`Export data for table ${config.type}`}
    onclick={open}
>
    <DownloadIcon class="size-4" />
</button>

<div
    bind:this={popoverEl}
    use:portal
    popover="auto"
    role="dialog"
    aria-modal="true"
    aria-label={t('title')}
    class="datatable-export-popover"
    ontoggle={handleToggle}
>
    <div class="datatable-export-card card bg-base-100 shadow-xl border border-base-300">
        <div
            class="datatable-export-mobile-header md:hidden flex items-center justify-between px-4 py-3 border-b border-base-300"
        >
            <span class="font-semibold">{t('title')}</span>
            <button type="button" class="btn btn-ghost btn-sm btn-circle" aria-label={t('close')} onclick={close}>
                <XIcon class="size-3" />
            </button>
        </div>
        <div class="datatable-export-body card-body gap-4 p-4">
            <label class="form-control gap-1">
                <span class="label-text text-sm font-medium">{t('format')}</span>
                <select class="select select-bordered select-sm" bind:value={exportState.selectedId}>
                    {#each exporters as exporter (exporter.id)}
                        <option value={exporter.id}>{exporterLabel(exporter.id)}</option>
                    {/each}
                </select>
            </label>

            {#if SettingsPanel}
                <SettingsPanel
                    settings={currentSettings}
                    onsettingschange={(next) => updateSettings(selectedExporter.id, next)}
                />
            {/if}

            {#if status.kind === 'loading'}
                <div class="datatable-export-progress flex flex-col gap-1">
                    <span class="text-xs">
                        {status.total > 0
                            ? format(`dataTable.${config.type}.export.progress`, {
                                  values: { loaded: status.loaded, total: status.total }
                              })
                            : format(`dataTable.${config.type}.export.progressUnknown`, {
                                  values: { loaded: status.loaded }
                              })}
                    </span>
                    <progress
                        class="progress progress-primary w-full"
                        value={status.total > 0 ? status.loaded : undefined}
                        max={status.total > 0 ? status.total : undefined}
                    ></progress>
                </div>
            {:else if status.kind === 'error'}
                <div role="alert" class="alert alert-error text-sm">
                    {format(`dataTable.${config.type}.export.error`, { values: { message: status.message } })}
                </div>
            {/if}

            <div class="flex flex-row items-center justify-between gap-2">
                <button type="button" class="btn btn-ghost btn-xs" onclick={resetDefaults}>
                    {t('resetDefaults')}
                </button>
                <div class="flex flex-row items-center gap-2">
                    {#if status.kind === 'loading'}
                        <button type="button" class="btn btn-ghost btn-sm" onclick={cancelExport}>
                            {t('cancel')}
                        </button>
                    {/if}

                    {#if isInvokable}
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            disabled={status.kind === 'loading'}
                            onclick={onDownload}
                        >
                            {status.kind === 'error' ? t('retry') : t('download')}
                        </button>
                    {:else}
                        <span class="text-xs opacity-70">{t('localUnavailable')}</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .datatable-export-popover {
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        overflow: visible;
        max-width: none;
        max-height: none;
    }

    .datatable-export-popover::backdrop {
        background: transparent;
        transition: background 150ms ease;
    }

    .datatable-export-popover {
        position: fixed;
        width: max-content;
        min-width: 20rem;
        max-width: min(22rem, calc(100vw - 1rem));
    }

    .datatable-export-card {
        width: 100%;
    }

    .datatable-export-mobile-header {
        display: none;
    }

    @media (max-width: 767.98px) {
        /* Scope mobile layout to the open state only — without `:popover-open`
           the `display: flex` would override the browser default of
           `display: none` for closed popovers and the dialog would be
           visible at all times. */
        .datatable-export-popover:popover-open {
            inset: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100vw - 2rem);
            max-width: 24rem;
            max-height: calc(100vh - 4rem);
            display: flex;
            flex-direction: column;
        }

        .datatable-export-popover::backdrop {
            background: rgb(0 0 0 / 50%);
        }

        .datatable-export-popover:popover-open .datatable-export-card {
            display: flex;
            flex-direction: column;
            max-height: 100%;
        }

        .datatable-export-popover:popover-open .datatable-export-mobile-header {
            display: flex;
        }

        .datatable-export-popover:popover-open .datatable-export-body {
            overflow-y: auto;
        }
    }
</style>
