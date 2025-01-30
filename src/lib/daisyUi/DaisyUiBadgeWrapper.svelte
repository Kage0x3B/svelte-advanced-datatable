<script lang="ts">
    import type { BadgeComponentProps } from '$lib/types/BadgeComponentProps.js';

    let { color, children }: BadgeComponentProps = $props();
</script>

<div
    class={[
        'badge',
        {
            'badge-error': color === 'red',
            'badge-success': color === 'green',
            'badge-info': color === 'blue',
            'badge-warning': color === 'yellow',
            // Badge neutral (without color) => gray
            'badge-neutral': color === 'gray',
            'badge-ghost': color === 'dark' || color === 'light'
        }
    ]}
>
    {@render children()}
</div>
