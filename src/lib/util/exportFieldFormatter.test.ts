import { ComponentType } from '$lib/dataComponent/ComponentType.js';
import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { _resetExportFieldFormatterWarnings, formatFieldForExport } from './exportFieldFormatter.js';

const passthrough: MessageFormatter = (id, options) => (options?.default !== undefined ? options.default : id);

const config = {
    type: 'test'
} as unknown as FullDataTableConfig<unknown>;

describe('formatFieldForExport', () => {
    it('returns empty string for null/undefined in CSV mode', () => {
        expect(
            formatFieldForExport(null, {}, { type: ComponentType.STRING } as ComponentTypeProperties, 'k', config, passthrough, 'csv')
        ).toBe('');
        expect(
            formatFieldForExport(undefined, {}, { type: ComponentType.STRING } as ComponentTypeProperties, 'k', config, passthrough, 'csv')
        ).toBe('');
    });

    it('returns null for null/undefined in JSON mode', () => {
        expect(
            formatFieldForExport(null, {}, { type: ComponentType.STRING } as ComponentTypeProperties, 'k', config, passthrough, 'json')
        ).toBeNull();
    });

    it('uses formatValue for CSV', () => {
        const colProps = {
            type: ComponentType.NUMBER,
            formatValue: (v: number) => `$${v}`
        } as unknown as ComponentTypeProperties;
        expect(formatFieldForExport(42, {}, colProps, 'k', config, passthrough, 'csv')).toBe('$42');
    });

    it('skips formatValue for JSON to preserve numeric type', () => {
        const colProps = {
            type: ComponentType.NUMBER,
            formatValue: (v: number) => `$${v}`
        } as unknown as ComponentTypeProperties;
        expect(formatFieldForExport(42, {}, colProps, 'k', config, passthrough, 'json')).toBe(42);
    });

    it('encodes Luxon DateTime as ISO', () => {
        const dt = DateTime.fromISO('2026-05-08T14:30:00', { zone: 'utc' });
        const colProps = { type: ComponentType.DATE } as ComponentTypeProperties;
        expect(formatFieldForExport(dt, {}, colProps, 'k', config, passthrough, 'csv')).toBe(
            dt.toISO()
        );
    });

    it('encodes JS Date as ISO', () => {
        const date = new Date('2026-05-08T14:30:00.000Z');
        const colProps = { type: ComponentType.DATE } as ComponentTypeProperties;
        expect(formatFieldForExport(date, {}, colProps, 'k', config, passthrough, 'csv')).toBe('2026-05-08T14:30:00.000Z');
    });

    it('translates enum values via the message formatter', () => {
        const enumFormatter: MessageFormatter = (id) => {
            if (id.endsWith('.active')) return 'Active';
            if (id.endsWith('.archived')) return 'Archived';
            return id;
        };
        const colProps = {
            type: ComponentType.ENUM,
            values: ['active', 'archived'],
            enumColorKey: { active: 'green', archived: 'gray', default: 'gray', unknown: 'gray' }
        } as unknown as ComponentTypeProperties;
        expect(formatFieldForExport('active', {}, colProps, 'status', config, enumFormatter, 'csv')).toBe('Active');
    });

    it('emits raw enum values for JSON', () => {
        const colProps = {
            type: ComponentType.ENUM,
            values: ['active'],
            enumColorKey: { active: 'green', default: 'gray', unknown: 'gray' }
        } as unknown as ComponentTypeProperties;
        expect(formatFieldForExport('active', {}, colProps, 'status', config, passthrough, 'json')).toBe('active');
    });

    it('honours useRawValues by skipping formatters', () => {
        const colProps = {
            type: ComponentType.NUMBER,
            formatValue: (v: number) => `$${v}`
        } as unknown as ComponentTypeProperties;
        expect(
            formatFieldForExport(42, {}, colProps, 'k', config, passthrough, 'csv', { useRawValues: true })
        ).toBe('42');
    });

    it('emits real booleans for JSON, with truthy comparison', () => {
        const colProps = {
            type: ComponentType.BOOLEAN,
            truthy: 1
        } as unknown as ComponentTypeProperties;
        expect(formatFieldForExport(1, {}, colProps, 'b', config, passthrough, 'json')).toBe(true);
        expect(formatFieldForExport(0, {}, colProps, 'b', config, passthrough, 'json')).toBe(false);
    });

    it('falls back to String(value) for CUSTOM with no formatValue and warns once', () => {
        _resetExportFieldFormatterWarnings();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const colProps = { type: ComponentType.CUSTOM } as ComponentTypeProperties;
        expect(formatFieldForExport(123, {}, colProps, 'custom1', config, passthrough, 'csv')).toBe('123');
        expect(formatFieldForExport(456, {}, colProps, 'custom1', config, passthrough, 'csv')).toBe('456');
        // Same key: warn fires once
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});

import { vi } from 'vitest';
