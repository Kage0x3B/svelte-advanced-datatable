import type { ComponentType } from './ComponentType.js';

export interface GenericComponentTypeProperties<T> {
    path: string;

    type: ComponentType;

    sortable: boolean;

    searchable: boolean;

    initialValueEditable: boolean;

    editable: boolean;

    hidden: boolean;

    cellHidden: boolean;
}
