import AngleLeftIcon from '$lib/daisyUi/icons/AngleLeftIcon.svelte';
import AngleRightIcon from '$lib/daisyUi/icons/AngleRightIcon.svelte';
import CheckIcon from '$lib/daisyUi/icons/CheckIcon.svelte';
import SortDownIcon from '$lib/daisyUi/icons/SortDownIcon.svelte';
import SortIcon from '$lib/daisyUi/icons/SortIcon.svelte';
import SortUpIcon from '$lib/daisyUi/icons/SortUpIcon.svelte';
import XIcon from '$lib/daisyUi/icons/XIcon.svelte';
import type { WrappedComponentColor, WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';
import type { Component } from 'svelte';

type DaisyUiColor =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'base-100'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

export const daisyUiColorMap: Record<WrappedComponentColor, DaisyUiColor> = {
    red: 'error',
    green: 'success',
    blue: 'info',
    gray: 'secondary',
    dark: 'neutral',
    light: 'base-100',
    yellow: 'warning'
};

export type DataTableIcon =
    | `${WrappedIconName}`
    | 'angle-left'
    | 'angle-right'
    | 'angles-left'
    | 'angles-right'
    | 'sort-down'
    | 'sort'
    | 'sort-up';

export const defaultDaisyUiIconMap = {
    'angle-left': AngleLeftIcon,
    'angle-right': AngleRightIcon,
    'angles-left': AngleLeftIcon,
    'angles-right': AngleRightIcon,
    check: CheckIcon,
    'sort-down': SortDownIcon,
    sort: SortIcon,
    'sort-up': SortUpIcon,
    cross: XIcon
} satisfies Record<DataTableIcon, Component>;
