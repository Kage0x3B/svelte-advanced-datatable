<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { ClassValue } from 'svelte/elements';
    import { setJoinGroupContext } from './context.js';

    interface Props {
        class?: ClassValue;
        vertical?: boolean;
        children: Snippet;
    }

    let { class: className = '', vertical = false, children }: Props = $props();

    setJoinGroupContext(true);
</script>

<div
    class={[
        'join',
        className,
        {
            'join-vertical': vertical
        }
    ]}
>
    {@render children()}
</div>
