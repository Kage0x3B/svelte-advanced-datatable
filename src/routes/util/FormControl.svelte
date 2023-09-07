<script lang="ts">
    import { classnames } from '$lib/util/generalUtil.js';

    export let label = '';
    let forId: string | undefined = undefined;
    export { forId as for };

    let className = '';
    export { className as class };

    $: labelClasses = classnames('label', className, {
        'cursor-pointer': !!forId
    });
</script>

{#if label}
    <label class={labelClasses} for={forId} {...$$restProps}>
        <span>{label}</span>

        <slot />
    </label>
{:else}
    <slot />
{/if}
