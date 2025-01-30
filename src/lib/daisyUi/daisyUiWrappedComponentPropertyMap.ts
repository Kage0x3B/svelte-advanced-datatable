/*export const daisyUiIconNameMap: Record<WrappedIconName, string> = {
	check: 'check',
	cross: 'x'
};*/

import type { WrappedComponentColor } from 'svelte-advanced-datatable';

type SveltestrapColor =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'base-100'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

export const daisyUiColorMap: Record<WrappedComponentColor, SveltestrapColor> = {
    red: 'error',
    green: 'success',
    blue: 'info',
    gray: 'secondary',
    dark: 'neutral',
    light: 'base-100',
    yellow: 'warning'
};
