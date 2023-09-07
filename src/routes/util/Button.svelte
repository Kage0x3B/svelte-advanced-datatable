<script lang="ts">
    import { classnames } from '$lib/util/generalUtil.js';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
    import type { ButtonVariantList, ThemeButtonSize } from './theme.js';

    let className = '';
    export { className as class };
    export let icon = false;
    export let loading = false;
    export let variant: ButtonVariantList;
    export let size: ThemeButtonSize | 'base' | undefined = undefined;
    export let submit = false;
    export let disabled = false;
    export let href = '';
    export let element = undefined;

    $: ariaLabel = $$props['aria-label'];

    $: classes = classnames(className, 'btn', variant, {
        // Sizes
        'btn-sm': !icon && size === 'sm',
        'btn-base': !icon && (!size || size === 'base'),
        'btn-lg': !icon && size === 'lg',
        'btn-xl': !icon && size === 'xl',
        'btn-icon-sm': !icon && size === 'sm',
        'btn-icon-base': (icon && !size) || size === 'base',
        'btn-icon-lg': icon && size === 'lg',
        'btn-icon-xl': icon && size === 'xl'
    });
</script>

{#if href}
    <a
        {...$$restProps}
        class={classes}
        disabled={disabled ? true : undefined}
        bind:this={element}
        on:click
        {href}
        aria-label={ariaLabel}
    >
        <slot />
    </a>
{:else}
    <button
        {...$$restProps}
        type={submit ? 'submit' : 'button'}
        class={classes}
        disabled={disabled ? true : undefined}
        bind:this={element}
        on:click
        aria-label={ariaLabel}
    >
        {#if loading}
            <ProgressRadial width="w-6" stroke="70" class="me-2" />
        {/if}
        <slot />
    </button>
{/if}
