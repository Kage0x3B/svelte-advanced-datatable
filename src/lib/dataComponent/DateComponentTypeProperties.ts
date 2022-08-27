import type { DateTime } from 'luxon';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface DateComponentTypeProperties extends GenericComponentTypeProperties<DateTime> {
    type: ComponentType.DATE;

    dateRelative: boolean;

    dateFormat: Intl.DateTimeFormatOptions;
}
