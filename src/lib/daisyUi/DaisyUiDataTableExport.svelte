<script lang="ts">
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import { createExportPersistedState, type InternalExportState } from '$lib/persistence/exportPersistence.svelte.js';
    import type { CreatedStores } from '$lib/persistence/createStores.svelte.js';
    import type { InternalDataTableState } from '$lib/types/DataTableState.js';
    import type { ExportRequest } from '$lib/types/Export.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import { configContext, dataSourceContext, messageFormatterContext } from '$lib/util/context.js';
    import { serializeCsv, type SerializeCsvColumn } from '$lib/util/exportCsvUtil.js';
    import { triggerDownload } from '$lib/util/exportDownloadUtil.js';
    import { fetchAllRows } from '$lib/util/exportFetcher.js';
    import { buildExportFilename } from '$lib/util/exportFilenameUtil.js';
    import { serializeJson, type SerializeJsonColumn } from '$lib/util/exportJsonUtil.js';
    import { DEFAULT_EXPORT_CSV_OPTIONS } from '$lib/persistence/codecs.js';
    import AngleRightIcon from './icons/AngleRightIcon.svelte';
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

    const exportState: InternalExportState = createExportPersistedState(stores);

    let triggerEl: HTMLButtonElement | undefined = $state();
    let popoverEl: HTMLDivElement | undefined = $state();

    type Status =
        | { kind: 'idle' }
        | { kind: 'loading'; loaded: number; total: number; controller: AbortController }
        | { kind: 'error'; message: string };

    let status: Status = $state({ kind: 'idle' });
    let advancedOpen = $state(false);

    const supportsLocalExport = $derived(typeof dataSource?.fetchOnce === 'function');
    const hasRemoteUrl = $derived(typeof config.buildExportUrl === 'function');

    /** Columns the export will produce, with labels resolved through the
     *  message formatter so headers match what users see on screen. */
    const exportColumns = $derived(
        visibleOrderedColumnKeys.map((key) => {
            const colProps = config.columnProperties[key] as ComponentTypeProperties | undefined;
            return {
                key,
                label: format(`dataTable.${config.type}.${key}.label`) as string,
                colProps
            };
        })
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

    const exportRequest = $derived<ExportRequest<unknown>>({
        ...baseRequest,
        format: exportState.format,
        csv: exportState.format === 'csv' ? exportState.csv : undefined,
        columns: visibleOrderedColumnKeys
    });

    const remoteUrl = $derived.by(() => {
        if (!hasRemoteUrl || !config.buildExportUrl) return undefined;
        try {
            return config.buildExportUrl(exportRequest);
        } catch (err) {
            console.error('svelte-advanced-datatable: buildExportUrl threw', err);
            return undefined;
        }
    });

    const filename = $derived(buildExportFilename(config.type, exportState.format));

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

    async function runLocalExport() {
        if (!dataSource.fetchOnce) return;

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

            let serialized: { content: string; mime: string };
            if (exportState.format === 'csv') {
                const cols: SerializeCsvColumn[] = exportColumns;
                serialized = serializeCsv({ rows, columns: cols, options: exportState.csv, config, format });
            } else {
                const cols: SerializeJsonColumn[] = exportColumns.map(({ key, colProps }) => ({ key, colProps }));
                serialized = serializeJson({ rows, columns: cols, config, format });
            }

            const blob = new Blob([serialized.content], { type: serialized.mime });
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

    function cancelExport() {
        if (status.kind === 'loading') {
            status.controller.abort();
            status = { kind: 'idle' };
        }
    }

    function resetDefaults() {
        exportState.format = 'csv';
        exportState.csv = { ...DEFAULT_EXPORT_CSV_OPTIONS };
    }

    function setCsv<K extends keyof typeof exportState.csv>(field: K, value: (typeof exportState.csv)[K]) {
        exportState.csv = { ...exportState.csv, [field]: value };
    }

    const t = (key: string) => format(`dataTable.${config.type}.export.${key}`) as string;
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
                <select class="select select-bordered select-sm" bind:value={exportState.format}>
                    <option value="csv">{t('formatCsv')}</option>
                    <option value="json">{t('formatJson')}</option>
                </select>
            </label>

            {#if exportState.format === 'csv'}
                <label class="form-control gap-1">
                    <span class="label-text text-sm font-medium">{t('delimiter')}</span>
                    <select
                        class="select select-bordered select-sm"
                        value={exportState.csv.delimiter}
                        onchange={(e) =>
                            setCsv(
                                'delimiter',
                                (e.currentTarget as HTMLSelectElement).value as typeof exportState.csv.delimiter
                            )}
                    >
                        <option value=",">{t('delimiterComma')}</option>
                        <option value=";">{t('delimiterSemicolon')}</option>
                        <option value="tab">{t('delimiterTab')}</option>
                        <option value="|">{t('delimiterPipe')}</option>
                    </select>
                </label>

                <label class="label cursor-pointer justify-start gap-2 py-0">
                    <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        checked={exportState.csv.includeHeader}
                        onchange={(e) => setCsv('includeHeader', (e.currentTarget as HTMLInputElement).checked)}
                    />
                    <span class="label-text">{t('includeHeader')}</span>
                </label>

                <details class="datatable-export-advanced" bind:open={advancedOpen}>
                    <summary class="cursor-pointer text-sm font-medium select-none flex items-center gap-1">
                        <AngleRightIcon class="datatable-export-chevron size-3 transition-transform" />
                        <span>{t('advanced')}</span>
                    </summary>
                    <div class="mt-2 flex flex-col gap-3">
                        <label class="label cursor-pointer justify-start gap-2 py-0">
                            <input
                                type="checkbox"
                                class="checkbox checkbox-sm"
                                checked={exportState.csv.utf8Bom}
                                onchange={(e) =>
                                    setCsv('utf8Bom', (e.currentTarget as HTMLInputElement).checked)}
                            />
                            <span class="label-text">{t('utf8Bom')}</span>
                        </label>

                        <label class="label cursor-pointer justify-start gap-2 py-0">
                            <input
                                type="checkbox"
                                class="checkbox checkbox-sm"
                                checked={exportState.csv.useRawValues}
                                onchange={(e) =>
                                    setCsv('useRawValues', (e.currentTarget as HTMLInputElement).checked)}
                            />
                            <span class="label-text">{t('useRawValues')}</span>
                        </label>

                        <label class="form-control gap-1">
                            <span class="label-text text-sm font-medium">{t('quoteChar')}</span>
                            <select
                                class="select select-bordered select-sm"
                                value={exportState.csv.quoteChar}
                                onchange={(e) =>
                                    setCsv(
                                        'quoteChar',
                                        (e.currentTarget as HTMLSelectElement)
                                            .value as typeof exportState.csv.quoteChar
                                    )}
                            >
                                <option value={'"'}>{t('quoteDouble')}</option>
                                <option value={"'"}>{t('quoteSingle')}</option>
                            </select>
                        </label>

                        <label class="form-control gap-1">
                            <span class="label-text text-sm font-medium">{t('lineEnding')}</span>
                            <select
                                class="select select-bordered select-sm"
                                value={exportState.csv.lineEnding}
                                onchange={(e) =>
                                    setCsv(
                                        'lineEnding',
                                        (e.currentTarget as HTMLSelectElement)
                                            .value as typeof exportState.csv.lineEnding
                                    )}
                            >
                                <option value={'\n'}>{t('lineEndingLf')}</option>
                                <option value={'\r\n'}>{t('lineEndingCrlf')}</option>
                            </select>
                        </label>
                    </div>
                </details>
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

                    {#if hasRemoteUrl && remoteUrl}
                        <a
                            class="btn btn-primary btn-sm"
                            href={remoteUrl}
                            download={filename}
                            onclick={() => close()}
                        >
                            {t('download')}
                        </a>
                    {:else if supportsLocalExport}
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            disabled={status.kind === 'loading'}
                            onclick={status.kind === 'error' ? runLocalExport : runLocalExport}
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

    /* Rotate the chevron when the details element is open. Targets the icon
       inside the summary so the disclosure state stays in sync with the open
       attribute regardless of how it was toggled. */
    .datatable-export-advanced > summary > :global(.datatable-export-chevron) {
        transition: transform 150ms ease;
    }
    .datatable-export-advanced[open] > summary > :global(.datatable-export-chevron) {
        transform: rotate(90deg);
    }
    /* Hide the default disclosure triangle. */
    .datatable-export-advanced > summary {
        list-style: none;
    }
    .datatable-export-advanced > summary::-webkit-details-marker {
        display: none;
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
