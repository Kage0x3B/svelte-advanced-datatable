import type { DataTableIcon } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
import { WrappedComponentColor } from '$lib/dataComponent/WrappedComponentProperty.js';

export interface IconComponentProps {
    name: DataTableIcon;
    color?: WrappedComponentColor | `${WrappedComponentColor}`;
}
