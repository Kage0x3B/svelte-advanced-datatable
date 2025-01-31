import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
import { type Component, getContext, setContext } from 'svelte';

export const DAISY_UI_ICON_MAP_CONTEXT_KEY = 'DAISY_UI_ICON_MAP_CONTEXT_KEY';
export const setIconMapContext = (iconMap: Partial<Record<DataTableIcon, Component>>) =>
    setContext(DAISY_UI_ICON_MAP_CONTEXT_KEY, iconMap);
export const getIconMapContext = () =>
    getContext<Partial<Record<DataTableIcon, Component>>>(DAISY_UI_ICON_MAP_CONTEXT_KEY);
