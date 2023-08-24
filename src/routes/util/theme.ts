export type ThemeVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'surface';

export type ButtonStyle = 'filled' | 'ghost' | 'soft' | 'ringed';

export type ButtonVariantList = `variant-${ButtonStyle}` | `variant-${ButtonStyle}-${ThemeVariant}`;

export type ThemeButtonSize = 'sm' | 'md' | 'lg' | 'xl';
