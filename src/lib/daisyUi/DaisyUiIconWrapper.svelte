<script lang="ts">
    import type { IconComponentProps } from '$lib/types/IconComponentProps.js';
    import CheckIcon from '$lib/daisyUi/icons/CheckIcon.svelte';
    import XIcon from '$lib/daisyUi/icons/XIcon.svelte';

    let { name, color }: IconComponentProps = $props();

    let IconComponent = $derived(name === 'check' ? CheckIcon : XIcon);
</script>

<IconComponent
    class={{
        'text-error': color === 'red',
        'text-success': color === 'green',
        'text-info': color === 'blue'
        // Color neutral (without color) => gray
    }}
/>
