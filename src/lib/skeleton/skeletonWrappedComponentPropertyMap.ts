import type { WrappedComponentColor, WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';

export const skeletonIconNameMap: Record<WrappedIconName, string> = {
    check: 'check',
    cross: 'x'
};

type SkeletonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'surface';
type SkeletonTextColor = `text-${SkeletonColor}-500`;

export const skeletonColorMap: Record<WrappedComponentColor, SkeletonTextColor> = {
    red: 'text-error-500',
    green: 'text-success-500',
    blue: 'text-tertiary-500',
    yellow: 'text-warning-500',
    gray: 'text-secondary-500',
    dark: 'text-surface-500',
    light: 'text-surface-500'
};
