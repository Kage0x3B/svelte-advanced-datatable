import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { describe, expect, it } from 'vitest';
import { serializeJson } from './exportJsonUtil.js';

const passthroughFormatter: MessageFormatter = (id, options) =>
    options?.default !== undefined ? options.default : id;

const config = {
    type: 'test',
    columnProperties: {} as Record<string, ComponentTypeProperties>
} as unknown as FullDataTableConfig<unknown>;

describe('serializeJson', () => {
    it('returns parseable JSON keyed by column key', () => {
        const result = serializeJson({
            rows: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ],
            columns: [
                { key: 'id', colProps: { type: ComponentType.NUMBER } as ComponentTypeProperties },
                { key: 'name', colProps: { type: ComponentType.STRING } as ComponentTypeProperties }
            ],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed).toEqual([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ]);
        expect(result.mime).toBe('application/json');
    });

    it('preserves number type and converts non-finite to null', () => {
        const result = serializeJson({
            rows: [{ price: 12.5 }, { price: Number.NaN }, { price: Number.POSITIVE_INFINITY }],
            columns: [{ key: 'price', colProps: { type: ComponentType.NUMBER } as ComponentTypeProperties }],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed[0].price).toBe(12.5);
        expect(parsed[1].price).toBeNull();
        expect(parsed[2].price).toBeNull();
    });

    it('writes nullish values as JSON null (not empty string)', () => {
        const result = serializeJson({
            rows: [{ name: null }, { name: undefined }],
            columns: [{ key: 'name', colProps: { type: ComponentType.STRING } as ComponentTypeProperties }],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed[0].name).toBeNull();
        expect(parsed[1].name).toBeNull();
    });

    it('writes booleans according to truthy/inverted', () => {
        const result = serializeJson({
            rows: [{ active: 1 }, { active: 0 }],
            columns: [
                {
                    key: 'active',
                    colProps: {
                        type: ComponentType.BOOLEAN,
                        truthy: 1,
                        inverted: false
                    } as unknown as ComponentTypeProperties
                }
            ],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed[0].active).toBe(true);
        expect(parsed[1].active).toBe(false);
    });

    it('writes raw enum values without translation', () => {
        const result = serializeJson({
            rows: [{ status: 'active' }],
            columns: [
                {
                    key: 'status',
                    colProps: {
                        type: ComponentType.ENUM,
                        values: ['active', 'archived'],
                        enumColorKey: { active: 'green', archived: 'gray', default: 'gray', unknown: 'gray' }
                    } as unknown as ComponentTypeProperties
                }
            ],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed[0].status).toBe('active');
    });

    it('encodes JS Date as ISO string', () => {
        const date = new Date('2026-05-08T14:30:00.000Z');
        const result = serializeJson({
            rows: [{ at: date }],
            columns: [{ key: 'at', colProps: { type: ComponentType.DATE } as ComponentTypeProperties }],
            config,
            format: passthroughFormatter
        });
        const parsed = JSON.parse(result.content);
        expect(parsed[0].at).toBe('2026-05-08T14:30:00.000Z');
    });
});
