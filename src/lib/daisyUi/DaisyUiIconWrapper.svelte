<script lang="ts">
    import { getIconMapContext } from '$lib/daisyUi/daisyUiContext.js';
    import { defaultDaisyUiIconMap } from '$lib/daisyUi/daisyUiWrappedComponentPropertyMap.js';
    import type { IconComponentProps } from '$lib/types/IconComponentProps.js';

    const iconMap = getIconMapContext();

    let { name, color }: IconComponentProps = $props();

    let IconComponent = $derived(iconMap[name] ?? defaultDaisyUiIconMap[name]);
</script>

<IconComponent
    class={{
        'text-error': color === 'red',
        'text-success': color === 'green',
        'text-info': color === 'blue'
        // Color neutral (without color) => gray
    }}
/>
