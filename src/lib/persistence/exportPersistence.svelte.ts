import type { ExportCsvOptions, ExportFormat } from '$lib/types/Export.js';
import { box } from 'svelte-toolbelt';
import { DEFAULT_EXPORT_CSV_OPTIONS, exportCsvOptionsCodec, exportFormatCodec } from './codecs.js';
import type { CreatedStores } from './createStores.svelte.js';

/**
 * Reactive view of the user's export preferences. Reads/writes go through the
 * persistent store backend (localStorage by default when persistence is opted
 * in; in-memory otherwise). Mirrors the `box.flatten` shape used elsewhere so
 * the popover can `bind:value` to fields directly.
 */
export interface InternalExportState {
    format: ExportFormat;
    csv: ExportCsvOptions;
}

const FIELD_KEY_FORMAT = 'exportFormat';
const FIELD_KEY_CSV = 'exportCsv';

/**
 * Build the export preferences as a reactive `InternalExportState`. Backed
 * by the same persistent store the rest of the persistence layer uses.
 */
export function createExportPersistedState(stores: CreatedStores): InternalExportState {
    const persistent = stores.persistent;
    const csvCodec = exportCsvOptionsCodec();
    const fallbackFormat: ExportFormat = 'csv';
    const fallbackCsv: ExportCsvOptions = { ...DEFAULT_EXPORT_CSV_OPTIONS };

    return box.flatten({
        format: box.with(
            () => persistent.get(FIELD_KEY_FORMAT, fallbackFormat, exportFormatCodec),
            (v) => persistent.set(FIELD_KEY_FORMAT, v, fallbackFormat, exportFormatCodec)
        ),
        csv: box.with(
            () => persistent.get(FIELD_KEY_CSV, fallbackCsv, csvCodec),
            (v) => persistent.set(FIELD_KEY_CSV, v, fallbackCsv, csvCodec)
        )
    }) as InternalExportState;
}
