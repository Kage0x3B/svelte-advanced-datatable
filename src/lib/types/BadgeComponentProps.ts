import { WrappedComponentColor } from '$lib/dataComponent/WrappedComponentProperty.js';
import type { Snippet } from 'svelte';

export interface BadgeComponentProps {
    color: WrappedComponentColor | `${WrappedComponentColor}`;
    children: Snippet;
}
