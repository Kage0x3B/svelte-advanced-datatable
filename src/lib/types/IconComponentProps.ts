import { WrappedComponentColor, type WrappedIconName } from '$lib/dataComponent/WrappedComponentProperty.js';

export interface IconComponentProps {
    name: WrappedIconName | `${WrappedIconName}`;
    color: WrappedComponentColor | `${WrappedComponentColor}`;
}
