import type { DateTime } from 'luxon';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.DATE}
 */
export interface DateComponentTypeProperties extends GenericComponentTypeProperties<DateTime> {
    type: ComponentType.DATE;

    /**
     * When using {@link https://moment.github.io/luxon luxon DateTime}, a format for the DateTime can be specified
     */
    dateFormat: Intl.DateTimeFormatOptions;
}
