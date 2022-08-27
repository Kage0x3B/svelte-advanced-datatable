<script lang='ts'>
	import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
	import { preventEvent } from '$lib/util/generalUtil.ts';
	import type { Readable } from 'svelte/store';
	import { readable } from 'svelte/store';

	let className = '';
	export { className as class };
	export let next = false;
	export let previous = false;
	export let first = false;
	export let last = false;
	export let ariaTranslationKey = '';
	export let href = '';

	const format: Readable<MessageFormatter> = readable((id, values) => id + JSON.stringify(values));

	$: classes = `${className} page-link`;

	let defaultAriaLabel;

	$: if (previous) {
		defaultAriaLabel = 'previous';
	} else if (next) {
		defaultAriaLabel = 'next';
	} else if (first) {
		defaultAriaLabel = 'first';
	} else if (last) {
		defaultAriaLabel = 'last';
	}

	$: translationKey = ariaTranslationKey || defaultAriaLabel;

	let defaultCaret;
	$: if (previous) {
		defaultCaret = '\u2039';
	} else if (next) {
		defaultCaret = '\u203A';
	} else if (first) {
		defaultCaret = '\u00ab';
	} else if (last) {
		defaultCaret = '\u00bb';
	}
</script>

<a {...$$restProps} class={classes} {href} on:click on:dragstart={preventEvent}>
	{#if previous || next || first || last}
        <span aria-hidden='true'>
            <slot>{defaultCaret}</slot>
        </span>&nbsp;<span class='sr-only d-none d-xl-inline'>{$format(`pagination.${translationKey}`)}</span>
	{:else}
		<slot />
	{/if}
</a>
