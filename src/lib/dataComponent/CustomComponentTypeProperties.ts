import type { SvelteComponent } from 'svelte';
import type { ComponentType } from './ComponentType.js';
import type { GenericComponentTypeProperties } from './GenericComponentTypeProperties.js';

export interface CustomComponentTypeProperties extends GenericComponentTypeProperties<unknown> {
    type: ComponentType.CUSTOM;

    component: typeof SvelteComponent;
}
