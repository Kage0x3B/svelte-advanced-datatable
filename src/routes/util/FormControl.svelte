<script lang="ts">
    import { classnames } from '$lib/component/util/util.js';

    

    interface Props {
        label?: string;
        for?: string | undefined;
        class?: string;
        children?: import('svelte').Snippet;
        [key: string]: any
    }

    let {
        label = '',
        for: forId = undefined,
        class: className = '',
        children,
        ...rest
    }: Props = $props();
    

    let labelClasses = $derived(classnames('label', className, {
        'cursor-pointer': !!forId
    }));
</script>

{#if label}
    <label class={labelClasses} for={forId} {...rest}>
        <span>{label}</span>

        {@render children?.()}
    </label>
{:else}
    {@render children?.()}
{/if}
