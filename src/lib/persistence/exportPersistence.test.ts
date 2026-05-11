import { builtinCsvExporter } from '$lib/export/builtinCsvExporter.js';
import { builtinJsonExporter } from '$lib/export/builtinJsonExporter.js';
import type { ResolvedExporter } from '$lib/types/Export.js';
import { describe, expect, it } from 'vitest';
import { exportSelectedIdCodec } from './codecs.js';
import type { CreatedStores } from './createStores.svelte.js';
import { createExportPersistedState } from './exportPersistence.svelte.js';
import { MemoryStateStore } from './MemoryStateStore.svelte.js';
import { SnapshotStateStore } from './SnapshotStateStore.svelte.js';

function makeStores(): CreatedStores {
    return {
        transient: new SnapshotStateStore(),
        persistent: new MemoryStateStore(),
        snapshot: undefined,
        destroy: () => {}
    };
}

const exporters: ResolvedExporter[] = [builtinCsvExporter(), builtinJsonExporter()];

describe('createExportPersistedState', () => {
    it('defaults selectedId to the first exporter id', () => {
        const stores = makeStores();
        const state = createExportPersistedState(stores, exporters);
        expect(state.selectedId).toBe('csv');
        expect(state.settings).toEqual({});
    });

    it('round-trips selectedId through the persistent store', () => {
        const stores = makeStores();
        const state = createExportPersistedState(stores, exporters);
        state.selectedId = 'json';
        // re-create — read goes through the same backing store
        const reread = createExportPersistedState(stores, exporters);
        expect(reread.selectedId).toBe('json');
    });

    it('codec falls back to the first exporter id when raw value is unknown', () => {
        // Codec-level validation kicks in for serializing backends (URL,
        // WebStorage). The in-memory store skips the codec entirely, so
        // assert this on the codec directly.
        const codec = exportSelectedIdCodec(exporters);
        expect(codec.decode('xlsx')).toBe('csv');
        expect(codec.decode('')).toBe('csv');
        expect(codec.decode('json')).toBe('json');
    });

    it('round-trips per-exporter settings as a flat record', () => {
        const stores = makeStores();
        const state = createExportPersistedState(stores, exporters);
        state.settings = { csv: { delimiter: ';' }, xlsx: { sheetName: 'Sheet1' } };
        const reread = createExportPersistedState(stores, exporters);
        expect(reread.settings).toEqual({
            csv: { delimiter: ';' },
            xlsx: { sheetName: 'Sheet1' }
        });
    });

    it('reverse-order exporters: selectedId default follows array order', () => {
        const stores = makeStores();
        const reversed: ResolvedExporter[] = [builtinJsonExporter(), builtinCsvExporter()];
        const state = createExportPersistedState(stores, reversed);
        expect(state.selectedId).toBe('json');
    });
});
