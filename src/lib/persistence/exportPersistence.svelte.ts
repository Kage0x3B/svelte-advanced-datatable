import type { ResolvedExporter } from '$lib/types/Export.js';
import { box } from 'svelte-toolbelt';
import { exportSelectedIdCodec, exportSettingsCodec } from './codecs.js';
import type { CreatedStores } from './createStores.svelte.js';

/**
 * Reactive view of the user's export preferences. Reads/writes go through the
 * persistent store backend (localStorage by default when persistence is opted
 * in; in-memory otherwise). Mirrors the `box.flatten` shape used elsewhere so
 * the popover can `bind:value` to fields directly.
 *
 * `selectedId` is the id of the active exporter. `settings` is a flat record
 * keyed by exporter id; each entry is the persisted (un-decoded) settings
 * payload for that exporter. The popover merges defaults and runs each
 * exporter's `settingsCodec` over the value when consuming it.
 */
export interface InternalExportState {
    selectedId: string;
    settings: Record<string, unknown>;
}

const FIELD_KEY_SELECTED_ID = 'exportSelectedId';
const FIELD_KEY_SETTINGS = 'exportSettings';

/**
 * Build the export preferences as a reactive `InternalExportState`. Backed
 * by the same persistent store the rest of the persistence layer uses.
 */
export function createExportPersistedState(
    stores: CreatedStores,
    exporters: readonly ResolvedExporter[]
): InternalExportState {
    const persistent = stores.persistent;
    const idCodec = exportSelectedIdCodec(exporters);
    const settingsCodec = exportSettingsCodec();
    const fallbackId = exporters[0]?.id ?? '';
    const fallbackSettings: Record<string, unknown> = {};

    return box.flatten({
        selectedId: box.with(
            () => persistent.get(FIELD_KEY_SELECTED_ID, fallbackId, idCodec),
            (v) => persistent.set(FIELD_KEY_SELECTED_ID, v, fallbackId, idCodec)
        ),
        settings: box.with(
            () => persistent.get(FIELD_KEY_SETTINGS, fallbackSettings, settingsCodec),
            (v) => persistent.set(FIELD_KEY_SETTINGS, v, fallbackSettings, settingsCodec)
        )
    }) as InternalExportState;
}
