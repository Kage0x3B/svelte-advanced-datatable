import type { WrappedComponentColor, WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';

export const sveltestrapIconNameMap: Record<WrappedIconName, string> = {
	check: 'check',
	cross: 'x'
};

type SveltestrapColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

export const sveltestrapColorMap: Record<WrappedComponentColor, SveltestrapColor> = {
	red: 'danger',
	green: 'success',
	blue: 'info',
	gray: 'secondary',
	dark: 'dark',
	light: 'light'
};
