import type { SvelteComponent } from 'svelte';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

/**
 * @see {@link ComponentType.CUSTOM}
 */
export interface CustomComponentTypeProperties extends GenericComponentTypeProperties<unknown> {
    type: ComponentType.CUSTOM;

    /**
     * The svelte component class which renders this component.
     *
     * The component receives these attributes:
     * ```javascript
     * export let key: string; // name of the column, a key of your data object, for example `firstName`
     * export let value: any; // value of this column
     * export let item: YourDataClass; // full data for this column
     * export let colProps: ComponentTypeProperties; // properties of this column
     * ```
     *
     * @see {@link ComponentTypeProperties}
     */
    component: typeof SvelteComponent;
}
