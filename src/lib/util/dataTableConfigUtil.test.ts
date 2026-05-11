import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
import { describe, expect, it } from 'vitest';
import { mergeDataTableConfigDefaults } from './dataTableConfigUtil.js';

function baseConfig(overrides: Partial<DataTableConfig<unknown>> = {}): DataTableConfig<unknown> {
    return {
        type: 'testTable',
        columnProperties: {},
        dataUniquePropertyKey: 'id' as never,
        ...overrides
    } as DataTableConfig<unknown>;
}

describe('mergeDataTableConfigDefaults — exporters', () => {
    it('defaults to [csv, json] in that order when exporters is omitted', () => {
        const full = mergeDataTableConfigDefaults(baseConfig());
        expect(full.resolvedExporters.map((e) => e.id)).toEqual(['csv', 'json']);
    });

    it('preserves the record key order in the resolved list', () => {
        const full = mergeDataTableConfigDefaults(
            baseConfig({ exporters: { json: {}, csv: {} } })
        );
        expect(full.resolvedExporters.map((e) => e.id)).toEqual(['json', 'csv']);
    });

    it('skips entries set to false', () => {
        const full = mergeDataTableConfigDefaults(
            baseConfig({ exporters: { csv: {}, json: false } })
        );
        expect(full.resolvedExporters.map((e) => e.id)).toEqual(['csv']);
    });

    it('returns an empty list when exporters === false', () => {
        const full = mergeDataTableConfigDefaults(baseConfig({ exporters: false }));
        expect(full.resolvedExporters).toEqual([]);
    });

    it('honors legacy hideExport when exporters is omitted', () => {
        const full = mergeDataTableConfigDefaults(baseConfig({ hideExport: true }));
        expect(full.resolvedExporters).toEqual([]);
    });

    it('throws when a custom exporter is missing extension', () => {
        expect(() =>
            mergeDataTableConfigDefaults(
                baseConfig({
                    exporters: {
                        xlsx: {
                            // @ts-expect-error intentional — extension is required
                            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            run: () => 'unused'
                        }
                    }
                })
            )
        ).toThrow(/extension/);
    });

    it('throws when a custom exporter is missing both run and buildUrl', () => {
        expect(() =>
            mergeDataTableConfigDefaults(
                baseConfig({
                    exporters: {
                        xlsx: {
                            extension: 'xlsx',
                            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        }
                    }
                })
            )
        ).toThrow(/run|buildUrl/);
    });

    it('accepts a custom exporter with run only', () => {
        const full = mergeDataTableConfigDefaults(
            baseConfig({
                exporters: {
                    xlsx: {
                        extension: 'xlsx',
                        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        run: () => 'unused'
                    }
                }
            })
        );
        expect(full.resolvedExporters.map((e) => e.id)).toEqual(['xlsx']);
        expect(full.resolvedExporters[0].extension).toBe('xlsx');
        expect(typeof full.resolvedExporters[0].run).toBe('function');
    });

    it('exposes a formats record merged with built-in csv/json labels', () => {
        const full = mergeDataTableConfigDefaults(
            baseConfig({
                messageConfig: {
                    export: {
                        formats: { xlsx: 'Excel' }
                    }
                } as DataTableConfig<unknown>['messageConfig']
            })
        );
        expect(full.messageConfig.export?.formats).toEqual({
            csv: 'CSV',
            json: 'JSON',
            xlsx: 'Excel'
        });
    });
});
