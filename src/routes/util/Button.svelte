<script lang="ts">
    import { clsx } from 'clsx';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { getJoinGroupContext } from './context.js';
    import type { ThemeButtonStyle, ThemeColor, ThemeSize } from './type/Theme.js';

    interface Props extends HTMLButtonAttributes {
        class?: string;
        active?: boolean;
        btnStyle?: ThemeButtonStyle;
        size?: ThemeSize;
        block?: boolean;
        wide?: boolean;
        loading?: boolean;
        hideContentWhileLoading?: boolean;
        color?: ThemeColor;
        submit?: boolean;
        disabled?: boolean;
        href?: string;
        element?: HTMLButtonElement | HTMLAnchorElement;
        children: Snippet;
    }

    let {
        class: className = '',
        active = false,
        btnStyle,
        size,
        block = false,
        wide = false,
        loading = false,
        hideContentWhileLoading = false,
        color = 'secondary',
        submit = false,
        disabled = false,
        href = '',
        element = $bindable(undefined),
        children,
        ...restProps
    }: Props = $props();

    const isJoinGroup = getJoinGroupContext();
    let isDisabled = $derived(disabled || loading);

    let ignoreColors = $derived(btnStyle === 'link');
    let classes = $derived(
        clsx(className, 'btn', {
            'btn-active': active,
            // Styles
            'btn-ghost': btnStyle === 'ghost',
            'btn-link': btnStyle === 'link',
            'btn-outline': btnStyle === 'outline',
            'btn-square': btnStyle === 'square',
            'btn-circle': btnStyle === 'circle',
            'btn-dash': btnStyle === 'dash',
            // Colors
            'btn-primary': color === 'primary' && !ignoreColors,
            'btn-secondary': color === 'secondary' && !ignoreColors,
            'btn-accent': color === 'accent' && !ignoreColors,
            'btn-info': color === 'info' && !ignoreColors,
            'btn-success': color === 'success' && !ignoreColors,
            'btn-warning': color === 'warning' && !ignoreColors,
            'btn-error': color === 'error' && !ignoreColors,
            // Sizes
            'btn-xs': size === 'xs',
            'btn-sm': size === 'sm',
            'btn-lg': size === 'lg',
            'btn-xl': size === 'xl',
            'btn-wide': wide,
            'btn-block': block,
            'btn-disabled': isDisabled,
            'join-item': isJoinGroup
        })
    );
</script>

{#if href}
    <a
        {...restProps}
        class={classes}
        aria-disabled={isDisabled}
        role="button"
        tabindex={disabled ? -1 : undefined}
        bind:this={element}
        {href}
    >
        {#if loading}
            <span class="loading loading-spinner"></span>
        {/if}
        {#if !(loading && hideContentWhileLoading)}
            {@render children()}
        {/if}
    </a>
{:else}
    <button
        {...restProps}
        type={submit ? 'submit' : 'button'}
        class={classes}
        disabled={isDisabled ? true : undefined}
        bind:this={element}
    >
        {#if loading}
            <span class="loading loading-spinner"></span>
        {/if}
        {#if !(loading && hideContentWhileLoading)}
            {@render children()}
        {/if}
    </button>
{/if}
