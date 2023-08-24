import type { WrappedComponentColor, WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';

export const skeletonIconNameMap: Record<WrappedIconName, string> = {
    check: 'check',
    cross: 'x'
};

type SkeletonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'surface';

export const skeletonColorMap: Record<WrappedComponentColor, SkeletonColor> = {
    red: 'error',
    green: 'success',
    blue: 'tertiary',
    yellow: 'warning',
    gray: 'secondary',
    dark: 'surface',
    light: 'surface'
};
