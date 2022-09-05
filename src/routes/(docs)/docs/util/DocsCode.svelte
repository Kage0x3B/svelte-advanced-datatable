<script lang='ts'>
	import { Highlight, HighlightSvelte } from 'svelte-highlight';
	import type { Language } from 'svelte-highlight/Highlight.svelte.js';
	import plaintext from 'svelte-highlight/languages/plaintext';

	export let code: string;
	export let language: Language | 'svelte' = plaintext;

	function cleanCode(code: string | undefined): string {
		if (!code) {
			return '';
		}

		code = code.trim().replace('&lt;', '<').replace(/^\s+/, '').replace(/\s+$/, '').replace(/\t/g, '    ');

		return code;
	}
</script>

<div class='my-2 border rounded-3 p-1'>
	{#if language === "svelte"}
		<HighlightSvelte code={cleanCode(code)} langtag />
	{:else}
		<Highlight {language} code={cleanCode(code)} langtag />
	{/if}
</div>

<style>
    div {
        background-color: #f9fafb;
    }

    div > :global(pre) {
        margin: 0;
        background-color: #f9fafb;
    }

    div > :global(pre > code) {
        background-color: transparent;
    }
</style>
