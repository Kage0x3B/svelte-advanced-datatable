import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { SerializedExport } from './exportCsvUtil.js';
import { formatFieldForExport } from './exportFieldFormatter.js';

export interface SerializeJsonColumn {
    key: string;
    colProps: ComponentTypeProperties | undefined;
}

export interface SerializeJsonParams {
    rows: Record<string, unknown>[];
    columns: SerializeJsonColumn[];
    config: FullDataTableConfig<unknown>;
    format: MessageFormatter;
}

/**
 * JSON writer. Produces a pretty-printed array of objects keyed by column
 * key (not label — keys round-trip; labels translate). Per-cell typing is
 * preserved where the column type allows it.
 */
export function serializeJson({ rows, columns, config, format }: SerializeJsonParams): SerializedExport {
    const out: Record<string, unknown>[] = [];

    for (const row of rows) {
        const obj: Record<string, unknown> = {};
        for (const c of columns) {
            obj[c.key] = formatFieldForExport(row[c.key], row, c.colProps, c.key, config, format, 'json');
        }
        // Defend against circular references inside row payloads — substitute
        // a placeholder rather than crashing the entire export.
        try {
            JSON.stringify(obj);
            out.push(obj);
        } catch (err) {
            console.warn('svelte-advanced-datatable: row dropped from JSON export due to non-serializable value', err);
            out.push({});
        }
    }

    return {
        content: JSON.stringify(out, null, 2),
        mime: 'application/json'
    };
}
