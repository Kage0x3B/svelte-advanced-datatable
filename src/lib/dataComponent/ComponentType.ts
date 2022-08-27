import type { DateTime } from 'luxon';
import type { DataRecord } from '../types/DataRecord.js';
import type { BooleanComponentTypeProperties } from './BooleanComponentTypeProperties.js';
import type { CustomComponentTypeProperties } from './CustomComponentTypeProperties.js';
import type { DateComponentTypeProperties } from './DateComponentTypeProperties.js';
import type { EnumComponentTypeProperties } from './EnumComponentTypeProperties.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';
import type { NumberComponentTypeProperties } from './NumberComponentTypeProperties.js';
import type { StringComponentTypeProperties } from './StringComponentTypeProperties.js';

export enum ComponentType {
    GENERIC = 'generic',
    NUMBER = 'number',
    STRING = 'string',
    BOOLEAN = 'boolean',
    ENUM = 'enum',
    CUSTOM = 'custom',
    DATE = 'date'
}

export type TextColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

export type ComponentTypeProperties = RequiredTypeProperty<BooleanComponentTypeProperties
    | NumberComponentTypeProperties
    | StringComponentTypeProperties
    | EnumComponentTypeProperties<string>
    | CustomComponentTypeProperties
    | DateComponentTypeProperties>;

export type ComponentTypeConfig<T, TP extends GenericComponentTypeProperties<T>> = {
    defaultValue?: T;
    defaultTypeProperties?: Partial<TP>;
    forcedTypeProperties?: Partial<TP>;
};

type RequiredTypeProperty<T extends { type: ComponentType }> = Required<Pick<T, 'type'>> & Partial<T>;

export type TableColumnConfig<T extends DataRecord = DataRecord> = Record<keyof T, ComponentTypeProperties>;

export const componentTypes: Record<ComponentType,
    ComponentTypeConfig<unknown, GenericComponentTypeProperties<unknown>>> = {
    generic: {
        defaultTypeProperties: {
            type: ComponentType.STRING,
            sortable: true,
            searchable: true,
            initialValueEditable: true,
            editable: true,
            hidden: false,
            cellHidden: false
        }
    } as ComponentTypeConfig<unknown, GenericComponentTypeProperties<unknown>>,
    boolean: {
        defaultValue: false,
        defaultTypeProperties: {
            truthy: true,
            inverted: false
        },
        forcedTypeProperties: {
            searchable: false
        }
    } as ComponentTypeConfig<boolean, BooleanComponentTypeProperties>,
    string: {
        defaultValue: ''
    } as ComponentTypeConfig<string, StringComponentTypeProperties>,
    number: {
        defaultValue: 0,
        forcedTypeProperties: {
            searchable: false
        }
    } as ComponentTypeConfig<number, NumberComponentTypeProperties>,
    enum: {
        defaultValue: '',
        defaultTypeProperties: {
            enumColorKey: {
                default: 'dark',
                unknown: 'secondary'
            }
        },
        forcedTypeProperties: {
            searchable: false
        }
    } as ComponentTypeConfig<string, EnumComponentTypeProperties<string>>,
    custom: {
        defaultTypeProperties: {
            searchable: false,
            sort: false,
            initialValueEditable: false,
            editable: false
        }
    } as ComponentTypeConfig<unknown, CustomComponentTypeProperties>,
    date: {
        defaultTypeProperties: {
            dateRelative: false,
            // Equivalent to luxons DATETIME_MED
            dateFormat: {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            }
        },
        forcedTypeProperties: {
            initialValueEditable: false,
            editable: false
        }
    } as ComponentTypeConfig<DateTime, DateComponentTypeProperties>
};
