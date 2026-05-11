<script lang="ts">
    import AngleRightIcon from '$lib/daisyUi/icons/AngleRightIcon.svelte';
    import type { ExportCsvOptions, ExporterSettingsProps } from '$lib/types/Export.js';
    import { configContext, messageFormatterContext } from '$lib/util/context.js';

    let { settings, onsettingschange }: ExporterSettingsProps<ExportCsvOptions> = $props();

    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const t = (key: string) => format(`dataTable.${config.type}.export.${key}`) as string;

    let advancedOpen = $state(false);

    function setCsv<K extends keyof ExportCsvOptions>(field: K, value: ExportCsvOptions[K]) {
        onsettingschange({ ...settings, [field]: value });
    }
</script>

<label class="form-control gap-1">
    <span class="label-text text-sm font-medium">{t('delimiter')}</span>
    <select
        class="select select-bordered select-sm"
        value={settings.delimiter}
        onchange={(e) => setCsv('delimiter', (e.currentTarget as HTMLSelectElement).value as ExportCsvOptions['delimiter'])}
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
        checked={settings.includeHeader}
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
                checked={settings.utf8Bom}
                onchange={(e) => setCsv('utf8Bom', (e.currentTarget as HTMLInputElement).checked)}
            />
            <span class="label-text">{t('utf8Bom')}</span>
        </label>

        <label class="label cursor-pointer justify-start gap-2 py-0">
            <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={settings.useRawValues}
                onchange={(e) => setCsv('useRawValues', (e.currentTarget as HTMLInputElement).checked)}
            />
            <span class="label-text">{t('useRawValues')}</span>
        </label>

        <label class="form-control gap-1">
            <span class="label-text text-sm font-medium">{t('quoteChar')}</span>
            <select
                class="select select-bordered select-sm"
                value={settings.quoteChar}
                onchange={(e) =>
                    setCsv('quoteChar', (e.currentTarget as HTMLSelectElement).value as ExportCsvOptions['quoteChar'])}
            >
                <option value={'"'}>{t('quoteDouble')}</option>
                <option value={"'"}>{t('quoteSingle')}</option>
            </select>
        </label>

        <label class="form-control gap-1">
            <span class="label-text text-sm font-medium">{t('lineEnding')}</span>
            <select
                class="select select-bordered select-sm"
                value={settings.lineEnding}
                onchange={(e) =>
                    setCsv('lineEnding', (e.currentTarget as HTMLSelectElement).value as ExportCsvOptions['lineEnding'])}
            >
                <option value={'\n'}>{t('lineEndingLf')}</option>
                <option value={'\r\n'}>{t('lineEndingCrlf')}</option>
            </select>
        </label>
    </div>
</details>

<style>
    .datatable-export-advanced > summary > :global(.datatable-export-chevron) {
        transition: transform 150ms ease;
    }
    .datatable-export-advanced[open] > summary > :global(.datatable-export-chevron) {
        transform: rotate(90deg);
    }
    .datatable-export-advanced > summary {
        list-style: none;
    }
    .datatable-export-advanced > summary::-webkit-details-marker {
        display: none;
    }
</style>
